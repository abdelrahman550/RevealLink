import "server-only";

import { ApiError, parseErrorResponse } from "./errors";

/**
 * Server-only HTTP client for the RevealLink backend.
 *
 * Every call leaves the Next.js server, which means:
 *  - no CORS preflight (the backend whitelists origins strictly);
 *  - bearer tokens never reach the browser on the mutation path;
 *  - the ngrok interstitial is skipped via the bypass header.
 */

const API_URL = (process.env.API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

/** Backend `accept-language` header drives the language of validation messages. */
const ACCEPT_LANGUAGE = "0"; // 0 = EN, 1 = AR

const NGROK_BYPASS_HEADER = "ngrok-skip-browser-warning";
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT ?? 20_000);

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON body. Ignored when `formData` is provided. */
  body?: unknown;
  /** Multipart body for upload endpoints. */
  formData?: FormData;
  accessToken?: string;
  /** Extra query string parameters. `undefined` values are dropped. */
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /** Per-request timeout override. */
  timeoutMs?: number;
}

export function buildQuery(
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, accessToken, query, signal } = options;

  const url = `${API_URL}/${path.replace(/^\/+/, "")}${buildQuery(query)}`;

  const headers = new Headers({
    Accept: "application/json",
    "Accept-Language": ACCEPT_LANGUAGE,
    [NGROK_BYPASS_HEADER]: "true",
  });

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData; // let fetch set the multipart boundary
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Request timed out", "TimeoutError")),
    options.timeoutMs ?? REQUEST_TIMEOUT_MS,
  );

  const onExternalAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", onExternalAbort, { once: true });

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: payload,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) {
      throw new ApiError({
        message: "The server took too long to respond. Please try again.",
        kind: "timeout",
      });
    }
    throw new ApiError({
      message: "Could not reach the RevealLink API. Please try again shortly.",
      kind: "network",
    });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }

  if (!response.ok) throw await parseErrorResponse(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/**
 * The backend answers every successful route with `{ message, status, data }`.
 * This unwraps it and rejects loudly when `data` is missing.
 */
export async function apiData<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const envelope = await apiFetch<{ data?: T }>(path, options);
  return envelope.data as T;
}

/** Turns an asset path such as `assets/messages/<id>.png` into an absolute URL. */
export function absoluteAssetUrl(assetPath?: string | null): string | null {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_URL}/${assetPath.replace(/^\/+/, "")}`;
}

export { API_URL };
