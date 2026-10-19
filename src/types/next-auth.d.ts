import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/api/types";

declare module "next-auth" {
  interface Session {
    /** Raw backend access token. Server-side only — never sent to the client. */
    accessToken?: string;
    /** Raw backend refresh token, used by the BFF proxy to rotate sessions. */
    refreshToken?: string;
    user: {
      id: string;
      role: Role;
      /**
       * Whether two-step verification is on. Carried in the session so the UI
       * can show the right state even when the profile endpoint omits it.
       */
      twoStepVerification?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: Role;
    twoStepVerification?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    role?: Role;
    twoStepVerification?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    role?: Role;
    twoStepVerification?: boolean;
  }
}
