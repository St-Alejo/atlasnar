import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HttpError,
  TimeoutError,
  withCache,
  withQueue,
  withRetry,
  withTimeout,
  type HttpClient,
} from "@/infrastructure/http";
import { RateLimitedQueue } from "@/infrastructure/queue/RateLimitedQueue";

const clientFrom = (impl: HttpClient["getJson"]): HttpClient & { calls: number } => {
  const client = {
    calls: 0,
    getJson: (request: Parameters<HttpClient["getJson"]>[0]) => {
      client.calls++;
      return impl(request);
    },
  };
  return client;
};

describe("withRetry", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("retries 429 and 5xx responses with backoff, then succeeds", async () => {
    let attempt = 0;
    const base = clientFrom(async ({ url }) => {
      attempt++;
      if (attempt === 1) throw new HttpError(429, url);
      if (attempt === 2) throw new HttpError(503, url);
      return { ok: true };
    });

    const result = withRetry(base, { retries: 2, baseDelayMs: 100 }).getJson({ url: "u" });
    await vi.runAllTimersAsync();
    await expect(result).resolves.toEqual({ ok: true });
    expect(base.calls).toBe(3);
  });

  it("does not retry client errors such as 404", async () => {
    const base = clientFrom(async ({ url }) => {
      throw new HttpError(404, url);
    });
    await expect(withRetry(base, { retries: 3 }).getJson({ url: "u" })).rejects.toBeInstanceOf(HttpError);
    expect(base.calls).toBe(1);
  });

  it("gives up after the configured number of retries", async () => {
    const base = clientFrom(async ({ url }) => {
      throw new HttpError(500, url);
    });
    const result = withRetry(base, { retries: 2, baseDelayMs: 10 }).getJson({ url: "u" });
    const expectation = expect(result).rejects.toMatchObject({ status: 500 });
    await vi.runAllTimersAsync();
    await expectation;
    expect(base.calls).toBe(3);
  });
});

describe("withTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("turns a slow request into a TimeoutError", async () => {
    const base = clientFrom(
      ({ signal }) =>
        new Promise((_, reject) => {
          signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );
    const result = withTimeout(base, 1000).getJson({ url: "slow" });
    const expectation = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await expectation;
  });

  it("keeps a caller abort as an abort, not a timeout", async () => {
    const base = clientFrom(
      ({ signal }) =>
        new Promise((_, reject) => {
          signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );
    const controller = new AbortController();
    const result = withTimeout(base, 1000).getJson({ url: "u", signal: controller.signal });
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("withCache", () => {
  it("shares one request per URL until the TTL expires", async () => {
    let now = 0;
    const base = clientFrom(async ({ url }) => ({ url }));
    const cached = withCache(base, { ttlMs: 1000, now: () => now });

    await Promise.all([cached.getJson({ url: "a" }), cached.getJson({ url: "a" })]);
    expect(base.calls).toBe(1);

    now = 1500;
    await cached.getJson({ url: "a" });
    expect(base.calls).toBe(2);
  });

  it("never caches failures", async () => {
    let fail = true;
    const base = clientFrom(async ({ url }) => {
      if (fail) throw new HttpError(500, url);
      return "ok";
    });
    const cached = withCache(base, { ttlMs: 60_000 });

    await expect(cached.getJson({ url: "a" })).rejects.toBeInstanceOf(HttpError);
    fail = false;
    await expect(cached.getJson({ url: "a" })).resolves.toBe("ok");
  });
});

describe("withQueue", () => {
  it("skips requests that were aborted while waiting in line", async () => {
    const base = clientFrom(async () => "ok");
    const queued = withQueue(base, new RateLimitedQueue({ concurrency: 1, minIntervalMs: 0 }));
    const controller = new AbortController();
    controller.abort();

    await expect(queued.getJson({ url: "u", signal: controller.signal })).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(base.calls).toBe(0);
  });
});
