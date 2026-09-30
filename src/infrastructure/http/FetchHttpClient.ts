import { HttpError, type HttpClient, type HttpRequest } from "./HttpClient";

export interface FetchHttpClientOptions {
  /** Sent on server requests so API operators can identify the app. Ignored by browsers. */
  readonly userAgent?: string;
}

export class FetchHttpClient implements HttpClient {
  constructor(private readonly options: FetchHttpClientOptions = {}) {}

  async getJson({ url, signal }: HttpRequest): Promise<unknown> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.options.userAgent) headers["User-Agent"] = this.options.userAgent;

    const response = await fetch(url, { headers, signal });
    if (!response.ok) throw new HttpError(response.status, url);
    return response.json();
  }
}
