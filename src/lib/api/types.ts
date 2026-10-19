/**
 * DTOs transcribed from the backend response builders.
 *
 * Backend envelope (src/common/utils/success.response.js):
 *   { message: string; status: number; data?: T }
 * Error envelope (src/middleware/error.middleware.js):
 *   { status: "fail" | "error"; message: string; extra?: unknown; stack?: string }
 */

/* ------------------------------------------------------------------ *
 * Enums — mirrors of src/common/enum/*
 * ------------------------------------------------------------------ */

export const GenderEnum = {
  MALE: 0,
  FEMALE: 1,
} as const;
export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum];

export const RoleEnum = {
  USER: 0,
  ADMIN: 1,
} as const;
export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];

export const ProviderEnum = {
  SYSTEM: 0,
  GOOGLE: 1,
} as const;
export type Provider = (typeof ProviderEnum)[keyof typeof ProviderEnum];

export const LogoutEnum = {
  ONE: 0,
  ALL: 1,
} as const;
export type LogoutAction = (typeof LogoutEnum)[keyof typeof LogoutEnum];

export const messagesFilterEnum = {
  RECEIVED: "received",
  SENT: "sent",
  BOTH: "both",
} as const;
export type MessagesFilter =
  (typeof messagesFilterEnum)[keyof typeof messagesFilterEnum];

export const revealStatusEnum = {
  NONE: "none",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type RevealStatus = (typeof revealStatusEnum)[keyof typeof revealStatusEnum];

export const revealRequestStatusEnum = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type RevealRequestStatus =
  (typeof revealRequestStatusEnum)[keyof typeof revealRequestStatusEnum];

export type RevealDecision = Exclude<RevealRequestStatus, "pending">;

/* ------------------------------------------------------------------ *
 * Shared shapes
 * ------------------------------------------------------------------ */

export type ObjectId = string;

/** { _id, userName, image } — participantSummary / userSummary */
export interface UserSummary {
  _id: ObjectId;
  userName: string;
  image?: string;
}

/** userResponse() in src/modules/users/user.response.js */
export interface User {
  _id: ObjectId;
  userName: string;
  email: string;
  phone: string;
  image?: string;
  coverImage: string[];
  gender: Gender;
  role: Role;
  twoStepVerification?: boolean;
}

/** POST /auth/login | /auth/verify-2FA-code | /auth/signup-with-gmail | /users/rotate-token */
export interface LoginCredentials {
  access_token: string;
  refresh_token: string;
}

export interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export interface Paginated<T> {
  pagination: Pagination;
}

/* ------------------------------------------------------------------ *
 * Messages — src/modules/messages/messages.response.js
 * ------------------------------------------------------------------ */

export interface AnonymousMessage {
  _id: ObjectId;
  content?: string;
  attachments: string[];
  revealStatus: RevealStatus;
  createdAt: string;
  /** Present only for the receiver when revealStatus === "approved". */
  sender?: UserSummary;
}

export interface MessageListResponse extends Paginated<AnonymousMessage> {
  messages: AnonymousMessage[];
}

/* ------------------------------------------------------------------ *
 * Reveal requests — src/modules/revealRequests/revealRequests.response.js
 * ------------------------------------------------------------------ */

export interface RevealRequest {
  _id: ObjectId;
  messageId: ObjectId;
  status: RevealRequestStatus;
  createdAt: string;
  updatedAt: string;
}

/** PATCH /reveal-requests/:requestId/:decision — only when approved. */
export interface DecideRevealResponse extends RevealRequest {
  conversationId?: ObjectId;
}

export interface ReceivedRevealRequest {
  _id: ObjectId;
  status: RevealRequestStatus;
  requester: UserSummary;
  message: {
    _id: ObjectId;
    content?: string;
    attachments: string[];
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SentRevealRequest {
  _id: ObjectId;
  messageId: ObjectId;
  status: RevealRequestStatus;
  /** Present only when status === "approved". */
  sender?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivedRevealRequestsResponse
  extends Paginated<ReceivedRevealRequest> {
  requests: ReceivedRevealRequest[];
}

export interface SentRevealRequestsResponse extends Paginated<SentRevealRequest> {
  requests: SentRevealRequest[];
}

/* ------------------------------------------------------------------ *
 * Conversations — src/modules/conversations/conversations.response.js
 * ------------------------------------------------------------------ */

export interface Conversation {
  _id: ObjectId;
  messageId: ObjectId;
  revealRequestId: ObjectId;
  sender: UserSummary;
  receiver: UserSummary;
  createdAt: string;
}

export interface ConversationMessage {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  content: string;
  createdAt: string;
}

export interface ConversationsResponse extends Paginated<Conversation> {
  conversations: Conversation[];
}

export interface ConversationMessagesResponse
  extends Paginated<ConversationMessage> {
  messages: ConversationMessage[];
}

/* ------------------------------------------------------------------ *
 * Request payloads
 * ------------------------------------------------------------------ */

export interface SignupInput {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  DOB: string;
  gender: Gender;
}

export interface EmailOtpInput {
  email: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  DOB?: string;
  gender?: Gender;
}

export interface ListQuery {
  page?: number;
  limit?: number;
}
