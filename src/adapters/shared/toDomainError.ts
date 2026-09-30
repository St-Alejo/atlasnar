import { z } from "zod";
import { domainError, type DomainError } from "@/domain/errors";
import { HttpError, TimeoutError, isAbortError } from "@/infrastructure/http";

/**
 * Translates infrastructure failures into typed domain errors.
 * Cancellation is not an error: aborts are re-thrown so callers can ignore them.
 */
export function toDomainError(error: unknown, source: string): DomainError {
  if (isAbortError(error)) throw error;

  if (error instanceof HttpError) {
    if (error.status === 404) return domainError("not-found", `${source}: resource not found`, 404);
    if (error.status === 429) return domainError("rate-limited", `${source}: rate limit exceeded`, 429);
    return domainError("upstream", `${source}: responded with ${error.status}`, error.status);
  }
  if (error instanceof TimeoutError) return domainError("timeout", `${source}: ${error.message}`);
  if (error instanceof z.ZodError) {
    return domainError("invalid-data", `${source}: unexpected response shape`);
  }
  return domainError("upstream", `${source}: ${error instanceof Error ? error.message : "unknown error"}`);
}
