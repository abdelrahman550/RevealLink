"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { conversationsApi } from "@/lib/api/endpoints";
import { requireAccessToken, runAction } from "@/lib/actions";
import { conversationMessageSchema, mongoIdSchema } from "@/lib/validation";

/** POST /conversations/:conversationId/messages */
const sendSchema = z.strictObject({
  conversationId: mongoIdSchema,
  content: conversationMessageSchema.shape.content,
});

export async function sendConversationMessageAction(input: unknown) {
  return runAction(sendSchema, input, async (values) => {
    const accessToken = await requireAccessToken();

    const message = await conversationsApi.sendMessage(
      values.conversationId,
      values.content,
      accessToken,
    );

    revalidatePath("/dashboard/conversations");
    return message;
  });
}
