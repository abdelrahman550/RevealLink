import { api } from "./base-api";
import type { User } from "@/lib/api/types";

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<User, void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery } = usersApi;
