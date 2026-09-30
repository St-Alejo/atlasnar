import type { ObservationProvider } from "@/domain/ports";
import { HTTP_TIMEOUT_MS, LAB_QUEUE } from "@/config/timing";
import { FetchHttpClient, withQueue, withRetry, withTimeout } from "@/infrastructure/http";
import { RateLimitedQueue } from "@/infrastructure/queue/RateLimitedQueue";
import { INaturalistProvider } from "./inaturalist/INaturalistProvider";

const BROWSER_RETRIES = 1;

let provider: ObservationProvider | null = null;

/**
 * Composition root for the browser (Field Lab). Same adapter as the server,
 * without the server-only User-Agent and with its own client-side queue.
 */
export function getBrowserObservationProvider(): ObservationProvider {
  if (!provider) {
    const queue = new RateLimitedQueue(LAB_QUEUE);
    const http = withQueue(
      withRetry(withTimeout(new FetchHttpClient(), HTTP_TIMEOUT_MS), { retries: BROWSER_RETRIES }),
      queue,
    );
    provider = new INaturalistProvider(http);
  }
  return provider;
}
