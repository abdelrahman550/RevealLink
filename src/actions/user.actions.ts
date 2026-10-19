"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { unstable_update as unstableUpdate } from "@/auth";
import { authApi, usersApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { requireAccessToken, runAction } from "@/lib/actions";
import { LIMITS } from "@/lib/constants";
import { emailSchema, otpSchema, profileSchema } from "@/lib/validation";

/** PATCH /users */
export async function updateProfileAction(input: unknown) {
  return runAction(profileSchema, input, async (values) => {
    const accessToken = await requireAccessToken();

    const user = await usersApi.updateProfile(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        ...(values.DOB ? { DOB: values.DOB } : {}),
        gender: values.gender,
      },
      accessToken,
    );

    revalidatePath("/dashboard", "layout");
    return user;
  });
}

const PROFILE_IMAGE_FIELD = "attachment";

/** POST /users/profile-image */
export async function uploadProfileImageAction(formData: FormData) {
  const file = formData.get(PROFILE_IMAGE_FIELD);

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false as const,
      message: "Choose an image to upload.",
      fieldErrors: { [PROFILE_IMAGE_FIELD]: "Choose an image to upload." },
    };
  }

  if (!LIMITS.allowedImageTypes.includes(file.type as never)) {
    return {
      ok: false as const,
      message: "That file type is not supported.",
      fieldErrors: { [PROFILE_IMAGE_FIELD]: "Use a JPEG, PNG or GIF image." },
    };
  }

  if (file.size > LIMITS.maxProfileImageBytes) {
    return {
      ok: false as const,
      message: "That image is too large.",
      fieldErrors: { [PROFILE_IMAGE_FIELD]: "Keep the image under 3 MB." },
    };
  }

  try {
    const accessToken = await requireAccessToken();

    const upload = new FormData();
    upload.append(PROFILE_IMAGE_FIELD, file);

    const { user } = await usersApi.uploadProfileImage(upload, accessToken);
    revalidatePath("/dashboard", "layout");
    return { ok: true as const, user };
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError({ message: "Upload failed. Please try again." });

    return {
      ok: false as const,
      message: apiError.message,
      fieldErrors: apiError.fieldErrors,
    };
  }
}

/* ---------------------- 2-step verification ----------------------- */

const start2FASchema = z.strictObject({ email: emailSchema });
const enable2FASchema = z.strictObject({ email: emailSchema, otp: otpSchema });

/** POST /auth/enable-2-step-verification — emails an OTP to the signed-in user. */
export async function start2FAAction(input: unknown) {
  return runAction(start2FASchema, input, async (values) => {
    const accessToken = await requireAccessToken();
    void accessToken;
    await authApi.send2StepVerificationCode(values.email);
    return { email: values.email };
  });
}

/** POST /auth/verify-2FA-enable-code */
export async function enable2FAAction(input: unknown) {
  return runAction(enable2FASchema, input, async (values) => {
    await requireAccessToken();
    await authApi.enable2StepVerification(values);

    // Record it on the session so the security card stays "enabled" across a
    // refresh, even though the profile endpoint may not echo the field yet.
    // A cookie-write hiccup must not undo a change the backend already saved.
    try {
      await unstableUpdate({ user: { twoStepVerification: true } });
    } catch {
      // Ignore — the profile refresh below is the fallback source.
    }

    revalidatePath("/dashboard", "layout");
    return { ok: true as const };
  });
}
