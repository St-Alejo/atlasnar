export interface HttpRequest {
  readonly url: string;
  readonly signal?: AbortSignal;
  /** Higher values jump ahead in rate-limited queues. */
  readonly priority?: number;
}

export interface HttpClient {
  getJson(request: HttpRequest): Promise<unknown>;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
    this.name = "HttpError";
  }
}

export class TimeoutError extends Error {
  constructor(
    readonly timeoutMs: number,
    readonly url: string,
  ) {
    super(`Request to ${url} timed out after ${timeoutMs} ms`);
    this.name = "TimeoutError";
  }
}

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";
