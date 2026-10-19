import { apiData, apiFetch, buildQuery } from "./client";
import type {
  AnonymousMessage,
  Conversation,
  ConversationMessage,
  ConversationMessagesResponse,
  ConversationsResponse,
  DecideRevealResponse,
  EmailOtpInput,
  ListQuery,
  LoginCredentials,
  LoginInput,
  LogoutAction,
  MessageListResponse,
  MessagesFilter,
  ReceivedRevealRequest,
  ReceivedRevealRequestsResponse,
  RevealRequestStatus,
  SentRevealRequestsResponse,
  SignupInput,
  UpdateProfileInput,
  User,
  UserSummary,
} from "./types";

/**
 * One typed function per backend route. Server actions and the BFF proxy are
 * the only callers — nothing here is imported by client components.
 */

interface CallOptions {
  accessToken?: string;
  formData?: FormData;
  signal?: AbortSignal;
}

/* ----------------------------- auth ------------------------------- */

export const authApi = {
  signup: (input: SignupInput, options?: CallOptions) =>
    apiData<User>("auth/signup", {
      method: "POST",
      body: input,
      accessToken: options?.accessToken,
      signal: options?.signal,
    }),

  login: (input: LoginInput, options?: CallOptions) =>
    apiFetch<{
      status?: number | string;
      message?: string;
      data?: LoginCredentials;
    }>("auth/login", {
      method: "POST",
      body: input,
      signal: options?.signal,
    }),

  /**
   * Returns the token pair, or `undefined` when the account has 2FA enabled.
   *
   * The backend answers 200 with the `data` key omitted once it has emailed a
   * code (`manageLogin` in authentication.service.js returns nothing when
   * `twoStepVerification` is on). A missing *or partial* token pair is treated
   * the same way, so an unexpected payload can never reach `startSession`.
   */
  loginReturningCredentials: async (
    input: LoginInput,
    options?: CallOptions,
  ): Promise<LoginCredentials | undefined> => {
    const result = await authApi.login(input, options);
    const tokens = result.data;

    if (
      tokens &&
      typeof tokens.access_token === "string" &&
      tokens.access_token.length > 0 &&
      typeof tokens.refresh_token === "string" &&
      tokens.refresh_token.length > 0
    ) {
      return tokens;
    }

    return undefined;
  },

  verify2FALogin: (input: EmailOtpInput) =>
    apiData<LoginCredentials>("auth/verify-2FA-code", {
      method: "POST",
      body: input,
    }),

  signupWithGmail: (idToken: string) =>
    apiData<LoginCredentials>("auth/signup-with-gmail", {
      method: "POST",
      body: { idToken },
    }),

  confirmEmail: (input: EmailOtpInput) =>
    apiData<void>("auth/confirm-email", { method: "PATCH", body: input }),

  resendConfirmationEmail: (email: string) =>
    apiData<void>("auth/resend-confirmation-email", {
      method: "PATCH",
      body: { email },
    }),

  forgotPassword: (email: string) =>
    apiData<void>("auth/forgot-password", { method: "POST", body: { email } }),

  verifyForgotPasswordCode: (input: EmailOtpInput) =>
    apiData<void>("auth/verify-forgot-password", {
      method: "POST",
      body: input,
    }),

  resetForgottenPassword: (input: {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
  }) =>
    apiData<void>("auth/reset-forgot-password", {
      method: "PATCH",
      body: input,
    }),

  /** Starts the "enable 2-step verification" email flow. */
  send2StepVerificationCode: (email: string) =>
    apiData<void>("auth/enable-2-step-verification", {
      method: "POST",
      body: { email },
    }),

  enable2StepVerification: (input: EmailOtpInput) =>
    apiData<void>("auth/verify-2FA-enable-code", { method: "POST", body: input }),
};

/* ----------------------------- users ------------------------------ */

export const usersApi = {
  me: (accessToken: string) =>
    apiData<User>("users", { accessToken }),

  updateProfile: (input: UpdateProfileInput, accessToken: string) =>
    apiData<User>("users", { method: "PATCH", body: input, accessToken }),

  uploadProfileImage: (formData: FormData, accessToken: string) =>
    apiData<{ user: User }>("users/profile-image", {
      method: "POST",
      formData,
      accessToken,
    }),

  rotateToken: (refreshToken: string) =>
    apiData<LoginCredentials>("users/rotate-token", {
      method: "POST",
      accessToken: refreshToken,
    }),

  logout: (accessToken: string, action: LogoutAction = 0) =>
    apiData<void>("users/logout", {
      method: "POST",
      body: { action },
      accessToken,
    }),

  /** GET /users with an arbitrary bearer token — used by Auth.js `authorize`. */
  verifyToken: (token: string) => usersApi.me(token),
};

/* ---------------------------- messages ---------------------------- */

export const messagesApi = {
  create: (formData: FormData, accessToken?: string) =>
    apiData<AnonymousMessage>("messages", {
      method: "POST",
      formData,
      accessToken,
    }),

  list: (
    params: ListQuery & { type?: MessagesFilter } = {},
    accessToken: string,
  ) =>
    apiData<MessageListResponse>("messages", {
      query: { page: params.page, limit: params.limit, type: params.type },
      accessToken,
    }),

  byId: (messageId: string, accessToken: string) =>
    apiData<AnonymousMessage>(`messages/${messageId}`, { accessToken }),

  remove: (messageId: string, accessToken: string) =>
    apiData<void>(`messages/${messageId}`, {
      method: "DELETE",
      accessToken,
    }),
};

/* ------------------------- reveal requests ------------------------ */

export const revealRequestsApi = {
  create: (messageId: string, accessToken: string) =>
    apiData<{ _id: string; messageId: string; status: RevealRequestStatus; createdAt: string; updatedAt: string }>(
      `reveal-requests/${messageId}`,
      { method: "POST", accessToken },
    ),

  received: (
    params: ListQuery & { status?: RevealRequestStatus } = {},
    accessToken: string,
  ) =>
    apiData<ReceivedRevealRequestsResponse>("reveal-requests/received", {
      query: { page: params.page, limit: params.limit, status: params.status },
      accessToken,
    }),

  sent: (params: ListQuery = {}, accessToken: string) =>
    apiData<SentRevealRequestsResponse>("reveal-requests/sent", {
      query: { page: params.page, limit: params.limit },
      accessToken,
    }),

  decide: (requestId: string, decision: "approved" | "rejected", accessToken: string) =>
    apiData<DecideRevealResponse>(
      `reveal-requests/${requestId}/${decision}`,
      { method: "PATCH", accessToken },
    ),
};

/* -------------------------- conversations ------------------------- */

export const conversationsApi = {
  list: (params: ListQuery = {}, accessToken: string) =>
    apiData<ConversationsResponse>("conversations", {
      query: { page: params.page, limit: params.limit },
      accessToken,
    }),

  messages: (conversationId: string, params: ListQuery = {}, accessToken: string) =>
    apiData<ConversationMessagesResponse>(
      `conversations/${conversationId}/messages${buildQuery({
        page: params.page,
        limit: params.limit,
      })}`,
      { accessToken },
    ),

  sendMessage: (conversationId: string, content: string, accessToken: string) =>
    apiData<ConversationMessage>(
      `conversations/${conversationId}/messages`,
      { method: "POST", body: { content }, accessToken },
    ),
};

/* -------------------------- re-exports ---------------------------- */

export type {
  AnonymousMessage,
  Conversation,
  ConversationMessage,
  ConversationMessagesResponse,
  ConversationsResponse,
  DecideRevealResponse,
  LoginCredentials,
  MessageListResponse,
  ReceivedRevealRequest,
  ReceivedRevealRequestsResponse,
  SentRevealRequestsResponse,
  User,
  UserSummary,
};
