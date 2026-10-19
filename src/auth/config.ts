import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { usersApi } from "@/lib/api/endpoints";

/**
 * Shape of the credentials handed over by `startSession`. The real login
 * already happened against the backend, so all we carry is the proven token
 * pair — never the password.
 */
const credentialsSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  /**
   * "true" when the caller already knows two-step verification is on (a
   * 2FA login just happened, or the user just enabled it). Credential values
   * are strings, so this arrives as "true" | "false".
   */
  twoStepVerification: z.string().optional(),
});

/**
 * Auth.js configuration.
 *
 * The credentials provider does not perform the login itself — that happens in
 * a server action so we can handle the backend's two-step (2FA) flow. Here we
 * only exchange a proven pair of backend tokens for a session.
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // aligned with REFRESH_TOKEN_EXPIRATION = 86400s
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "RevealLink",
      credentials: {
        accessToken: { label: "Access token", type: "text" },
        refreshToken: { label: "Refresh token", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) return null;

        try {
          // Confirms the token is valid and loads the profile that fills the session.
          const user = await usersApi.me(parsed.data.accessToken);
          return {
            id: user._id,
            name: user.userName,
            email: user.email,
            image: user.image ?? null,
            role: user.role,
            accessToken: parsed.data.accessToken,
            refreshToken: parsed.data.refreshToken,
            // An explicit claim from the caller wins: after a two-step sign-in
            // the flag is known even if the profile endpoint omits it.
            twoStepVerification:
              parsed.data.twoStepVerification === "true" ||
              user.twoStepVerification === true,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id ?? token.sub;
        token.role = user.role ?? 0;
        token.twoStepVerification = user.twoStepVerification ?? false;
      }

      // `unstable_update` from a server action (turning 2FA on) lands here.
      if (trigger === "update" && session?.user?.twoStepVerification !== undefined) {
        token.twoStepVerification = session.user.twoStepVerification;
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      if (session.user) {
        session.user.id = token.id ?? token.sub ?? "";
        session.user.role = token.role ?? 0;
        session.user.twoStepVerification = token.twoStepVerification ?? false;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
