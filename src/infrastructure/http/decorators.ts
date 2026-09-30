import type { RateLimitedQueue } from "../queue/RateLimitedQueue";
import { HttpError, TimeoutError, isAbortError, type HttpClient, type HttpRequest } from "./HttpClient";

/** Aborts a request that takes longer than `timeoutMs`. */
export function withTimeout(client: HttpClient, timeoutMs: number): HttpClient {
  return {
    async getJson(request) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const signal = request.signal
        ? AbortSignal.any([request.signal, controller.signal])
        : controller.signal;

      try {
        return await client.getJson({ ...request, signal });
      } catch (error) {
        const timedOut = controller.signal.aborted && !request.signal?.aborted;
        if (timedOut) throw new TimeoutError(timeoutMs, request.url);
        throw error;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export interface RetryOptions {
  readonly retries: number;
  readonly baseDelayMs?: number;
}

const DEFAULT_RETRY_BASE_DELAY_MS = 500;

export const isRetryable = (error: unknown): boolean =>
  error instanceof TimeoutError ||
  (error instanceof HttpError && (error.status === 429 || error.status >= 500)) ||
  (error instanceof TypeError && !isAbortError(error)); // network failure

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/** Retries rate-limit, server and network errors with exponential backoff. */
export function withRetry(client: HttpClient, options: RetryOptions): HttpClient {
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS;
  return {
    async getJson(request) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await client.getJson(request);
        } catch (error) {
          if (attempt >= options.retries || !isRetryable(error) || request.signal?.aborted) {
            throw error;
          }
          await sleep(baseDelayMs * 2 ** attempt, request.signal);
        }
      }
    },
  };
}

/** Serialises requests through a rate-limited queue. */
export function withQueue(client: HttpClient, queue: RateLimitedQueue): HttpClient {
  return {
    getJson(request) {
      return queue.enqueue(() => {
        // A request cancelled while waiting in line never hits the network.
        if (request.signal?.aborted) return Promise.reject(request.signal.reason);
        return client.getJson(request);
      }, request.priority ?? 0);
    },
  };
}

export interface CacheOptions {
  readonly ttlMs: number;
  readonly maxEntries?: number;
  readonly now?: () => number;
}

const DEFAULT_CACHE_MAX_ENTRIES = 500;

/**
 * In-memory cache keyed by URL. Concurrent calls for the same URL share one
 * in-flight promise; failures are never cached.
 */
export function withCache(client: HttpClient, options: CacheOptions): HttpClient {
  const now = options.now ?? Date.now;
  const maxEntries = options.maxEntries ?? DEFAULT_CACHE_MAX_ENTRIES;
  const entries = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

  return {
    getJson(request: HttpRequest) {
      const cached = entries.get(request.url);
      if (cached && cached.expiresAt > now()) return cached.value;

      const value = client.getJson(request);
      entries.set(request.url, { expiresAt: now() + options.ttlMs, value });
      if (entries.size > maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest !== undefined) entries.delete(oldest);
      }
      value.catch(() => entries.delete(request.url));
      return value;
    },
  };
}
