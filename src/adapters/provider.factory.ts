import "server-only";
import type { ObservationProvider, TaxonomyProvider } from "@/domain/ports";
import {
  GBIF_QUEUE,
  HTTP_RETRIES,
  HTTP_TIMEOUT_MS,
  INAT_QUEUE,
  TAXONOMY_CACHE_TTL_MS,
} from "@/config/timing";
import { env } from "@/infrastructure/config/env";
import {
  FetchHttpClient,
  withCache,
  withQueue,
  withRetry,
  withTimeout,
  type HttpClient,
} from "@/infrastructure/http";
import { RateLimitedQueue } from "@/infrastructure/queue/RateLimitedQueue";
import { GbifProvider } from "./gbif/GbifProvider";
import { INaturalistProvider } from "./inaturalist/INaturalistProvider";

// One queue per upstream API and per process (see README §7.1).
const iNatQueue = new RateLimitedQueue(INAT_QUEUE);
const gbifQueue = new RateLimitedQueue(GBIF_QUEUE);

/**
 * Decorator chain, outermost first:
 * cache → queue → retry → timeout → fetch.
 * Cache hits skip the queue; retries keep their slot so backoff also throttles.
 */
function createHttpClient(queue: RateLimitedQueue, cacheTtlMs: number | null): HttpClient {
  const base = new FetchHttpClient({ userAgent: env.INAT_USER_AGENT });
  const resilient = withRetry(withTimeout(base, HTTP_TIMEOUT_MS), { retries: HTTP_RETRIES });
  const queued = withQueue(resilient, queue);
  return cacheTtlMs === null ? queued : withCache(queued, { ttlMs: cacheTtlMs });
}

/** Taxonomy lookups are cached; observations must stay fresh for SSR/ISR. */
export function createTaxonomyProvider(): TaxonomyProvider {
  return new GbifProvider(createHttpClient(gbifQueue, TAXONOMY_CACHE_TTL_MS));
}

export function createOccurrenceProvider(): TaxonomyProvider {
  return new GbifProvider(createHttpClient(gbifQueue, null));
}

export function createProfileProvider(): ObservationProvider {
  return new INaturalistProvider(createHttpClient(iNatQueue, TAXONOMY_CACHE_TTL_MS));
}

export function createObservationProvider(): ObservationProvider {
  return new INaturalistProvider(createHttpClient(iNatQueue, null));
}
