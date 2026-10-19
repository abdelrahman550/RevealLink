"use server";

import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { authApi, usersApi } from "@/lib/api/endpoints";
import type { LoginCredentials } from "@/lib/api/types";
import { runAction } from "@/lib/actions";
import {
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  otpFormSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation";

/** Exchanges a verified token pair for an Auth.js session cookie. */
const SESSION_START_FAILED =
  "We couldn't start your session. Please try signing in again.";

async function startSession(
  tokens: LoginCredentials,
  twoStepVerification = false,
): Promise<void> {
  let result: unknown;

  try {
    result = await signIn("credentials", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      twoStepVerification: twoStepVerification ? "true" : "false",
      redirect: false,
    });
  } catch {
    // Auth.js throws on an unauthorized credentials sign-in.
    throw new Error(SESSION_START_FAILED);
  }

  // Auth.js answers with an error URL instead of throwing in some paths.
  if (typeof result === "string" && result.includes("error=")) {
    throw new Error(SESSION_START_FAILED);
  }
}

export type LoginActionResult =
  | { requires2FA: false }
  | { requires2FA: true; email: string };

/**
 * POST /auth/login
 * A `undefined` `data` in the response means 2FA is enabled on the account —
 * the backend has already emailed a code.
 */
export async function loginAction(input: unknown) {
  return runAction(loginSchema, input, async (values): Promise<LoginActionResult> => {
    const credentials = await authApi.loginReturningCredentials(values);

    if (!credentials) {
      return { requires2FA: true, email: values.email };
    }

    await startSession(credentials);
    return { requires2FA: false };
  });
}

/** POST /auth/verify-2FA-code */
export async function verify2FALoginAction(input: unknown) {
  return runAction(otpFormSchema, input, async (values) => {
    const tokens = await authApi.verify2FALogin(values);
    // Reaching this point proves two-step verification is on for the account.
    await startSession(tokens, true);
    return { ok: true as const };
  });
}

/** POST /auth/signup — the account is created unconfirmed; an OTP is emailed. */
export async function registerAction(input: unknown) {
  return runAction(registerSchema, input, async (values) => {
    const user = await authApi.signup(values);
    return { email: user.email };
  });
}

/** PATCH /auth/confirm-email */
export async function confirmEmailAction(input: unknown) {
  return runAction(otpFormSchema, input, async (values) => {
    await authApi.confirmEmail(values);
    return { ok: true as const };
  });
}

/** PATCH /auth/resend-confirmation-email */
export async function resendConfirmationAction(input: unknown) {
  return runAction(emailSchema.transform((email) => ({ email })), input, async (values) => {
    await authApi.resendConfirmationEmail(values.email);
    return { ok: true as const };
  });
}

/** POST /auth/forgot-password */
export async function forgotPasswordAction(input: unknown) {
  return runAction(emailSchema.transform((email) => ({ email })), input, async (values) => {
    await authApi.forgotPassword(values.email);
    return { email: values.email };
  });
}

/** POST /auth/verify-forgot-password */
export async function verifyForgotPasswordAction(input: unknown) {
  return runAction(otpFormSchema, input, async (values) => {
    await authApi.verifyForgotPasswordCode(values);
    return { email: values.email, otp: values.otp };
  });
}

/** PATCH /auth/reset-forgot-password */
export async function resetPasswordAction(input: unknown) {
  return runAction(resetPasswordSchema, input, async (values) => {
    await authApi.resetForgottenPassword(values);
    return { ok: true as const };
  });
}

const googleCredentialSchema = z.object({
  idToken: z.string().min(20, "Google did not return a valid credential."),
});

/** POST /auth/signup-with-gmail */
export async function googleSignInAction(idToken: string) {
  return runAction(googleCredentialSchema, { idToken }, async (values) => {
    const tokens = await authApi.signupWithGmail(values.idToken);
    await startSession(tokens);
    return { ok: true as const };
  });
}

/** POST /users/logout — then clears the local session cookie. */
export async function logoutAction(action: 0 | 1 = 0) {
  const { getAccessToken } = await import("@/lib/session");
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      await usersApi.logout(accessToken, action);
    } catch {
      // The backend may have already invalidated the token — sign out regardless.
    }
  }

  await signOut({ redirect: false });
  return { ok: true as const };
}
