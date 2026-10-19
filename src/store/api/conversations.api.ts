import { api } from "./base-api";
import type {
  ConversationMessagesResponse,
  ConversationsResponse,
} from "@/lib/api/types";

export const conversationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<
      ConversationsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/conversations",
        params: { page, limit },
      }),
      providesTags: ["Conversations"],
    }),

    getConversationMessages: build.query<
      ConversationMessagesResponse,
      { conversationId: string; page?: number; limit?: number }
    >({
      query: ({ conversationId, page = 1, limit = 30 }) => ({
        url: `/conversations/${conversationId}/messages`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { conversationId }) => [
        { id: conversationId, type: "ConversationMessages" },
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetConversationMessagesQuery,
} = conversationsApi;
