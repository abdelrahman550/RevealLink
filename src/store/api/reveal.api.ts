import { api } from "./base-api";
import type {
  ReceivedRevealRequestsResponse,
  RevealRequestStatus,
  SentRevealRequestsResponse,
} from "@/lib/api/types";

export const revealApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReceivedRevealRequests: build.query<
      ReceivedRevealRequestsResponse,
      { status?: RevealRequestStatus | "all"; page?: number; limit?: number }
    >({
      query: ({ status = "all", page = 1, limit = 10 }) => ({
        url: "/reveal-requests/received",
        params: {
          page,
          limit,
          ...(status && status !== "all" ? { status } : {}),
        },
      }),
      providesTags: ["ReceivedRevealRequests"],
    }),

    getSentRevealRequests: build.query<
      SentRevealRequestsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/reveal-requests/sent",
        params: { page, limit },
      }),
      providesTags: ["SentRevealRequests"],
    }),
  }),
});

export const {
  useGetReceivedRevealRequestsQuery,
  useGetSentRevealRequestsQuery,
} = revealApi;
