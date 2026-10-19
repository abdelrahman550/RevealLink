import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

/**
 * All reads go through the BFF proxy at /api/backend/*, which attaches the
 * session's bearer token server-side and transparently refreshes it.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/backend",
  credentials: "include",
});

type NormalizedError = FetchBaseQueryError & { message: string };

/**
 * The backend answers every route with `{ message, status, data }` and the BFF
 * proxy relays that envelope verbatim. RTK consumers expect the payload itself
 * (see the DTOs in `lib/api/types.ts`), so unwrap it here.
 *
 * `status` is a number on success and the string "fail"/"error" on failure, so
 * a numeric `status` together with a `data` key identifies the success
 * envelope — and no payload DTO has a numeric `status` field, so this is safe.
 */
function unwrapEnvelope<T>(body: T): T {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return body;

  const envelope = body as { status?: unknown; data?: unknown };
  if (typeof envelope.status === "number" && "data" in envelope) {
    return envelope.data as T;
  }

  return body;
}

/** Flattens the backend's `{ status, message }` error envelope onto `error`. */
const baseQueryWithMessage: BaseQueryFn<
  string | FetchArgs,
  unknown,
  NormalizedError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const data = result.error.data as { message?: string } | undefined;
    const message =
      data?.message ??
      (typeof result.error.status === "number"
        ? `Request failed with status ${result.error.status}.`
        : "Could not reach the server.");

    return {
      ...result,
      error: { ...result.error, message } as NormalizedError,
    };
  }

  return { ...result, data: unwrapEnvelope(result.data) };
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithMessage,
  tagTypes: [
    "User",
    "Messages",
    "Message",
    "ReceivedRevealRequests",
    "SentRevealRequests",
    "Conversations",
    "ConversationMessages",
  ],
  endpoints: () => ({}),
});
