import { api } from "./base-api";
import type { MessageListResponse, MessagesFilter } from "@/lib/api/types";

export const messagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMessages: build.query<
      MessageListResponse,
      { type?: MessagesFilter; page?: number; limit?: number }
    >({
      query: ({ type = "received", page = 1, limit = 10 }) => ({
        url: "/messages",
        params: { type, page, limit },
      }),
      providesTags: (_result, _error, { type }) => [
        { id: type ?? "received", type: "Messages" },
        "Messages",
      ],
    }),

    getMessage: build.query<
      MessageListResponse["messages"][number],
      string
    >({
      query: (messageId) => `/messages/${messageId}`,
      providesTags: (_result, _error, messageId) => [
        { id: messageId, type: "Message" },
      ],
    }),
  }),
});

export const { useGetMessagesQuery, useGetMessageQuery } = messagesApi;
