"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { messagesApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { requireAccessToken, runAction } from "@/lib/actions";
import { LIMITS } from "@/lib/constants";
import { messageContentSchema, mongoIdSchema } from "@/lib/validation";

/**
 * POST /messages
 *
 * Works for both signed-in and anonymous senders — the backend treats a missing
 * bearer token as a genuinely anonymous message. Up to 3 image attachments.
 */

const ATTACHMENT_FIELD = "attachments";

const composeSchema = z.strictObject({
  receiverId: mongoIdSchema,
  content: messageContentSchema,
});

function collectFiles(formData: FormData): File[] {
  return formData
    .getAll(ATTACHMENT_FIELD)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function validateFiles(files: File[]): string | null {
  if (files.length > LIMITS.maxAttachments) {
    return `You can upload up to ${LIMITS.maxAttachments} images only.`;
  }

  for (const file of files) {
    if (!LIMITS.allowedImageTypes.includes(file.type as never)) {
      return `"${file.name}" is not a JPEG, PNG or GIF.`;
    }
    if (file.size > LIMITS.maxAttachmentBytes) {
      return `"${file.name}" is larger than ${Math.round(LIMITS.maxAttachmentBytes / 1024 / 1024)} MB.`;
    }
  }

  return null;
}

export async function createMessageAction(formData: FormData) {
  const fields = composeSchema.safeParse({
    receiverId: formData.get("receiverId"),
    content: formData.get("content") ?? "",
  });

  if (!fields.success) {
    const issue = fields.error.issues[0];
    return {
      ok: false as const,
      message: issue?.message ?? "Please fix the highlighted fields.",
      fieldErrors: issue?.path.length
        ? { [issue.path.join(".")]: issue.message }
        : { content: issue?.message ?? "Invalid message." },
    };
  }

  const files = collectFiles(formData);
  const fileError = validateFiles(files);
  if (fileError) {
    return {
      ok: false as const,
      message: fileError,
      fieldErrors: { [ATTACHMENT_FIELD]: fileError },
    };
  }

  try {
    // A live session is optional here — anonymous is a supported sender.
    const accessToken = await requireAccessToken().catch(() => undefined);

    const payload = new FormData();
    payload.append("receiverId", fields.data.receiverId);
    payload.append("content", fields.data.content);
    for (const file of files) payload.append(ATTACHMENT_FIELD, file);

    const message = await messagesApi.create(payload, accessToken);

    revalidatePath("/dashboard/messages");
    return { ok: true as const, message };
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError({ message: "Your message could not be sent. Please try again." });

    return {
      ok: false as const,
      message: apiError.message,
      fieldErrors: apiError.fieldErrors,
    };
  }
}

/** DELETE /messages/:messageId — receivers only. */
const deleteMessageSchema = z.strictObject({ messageId: mongoIdSchema });

export async function deleteMessageAction(input: unknown) {
  return runAction(deleteMessageSchema, input, async (values) => {
    const accessToken = await requireAccessToken();
    await messagesApi.remove(values.messageId, accessToken);
    revalidatePath("/dashboard/messages");
    return { ok: true as const };
  });
}
