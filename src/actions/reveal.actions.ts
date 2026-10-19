"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revealRequestsApi } from "@/lib/api/endpoints";
import { requireAccessToken, runAction } from "@/lib/actions";
import { mongoIdSchema } from "@/lib/validation";

/** POST /reveal-requests/:messageId */
const createSchema = z.strictObject({ messageId: mongoIdSchema });

export async function createRevealRequestAction(input: unknown) {
  return runAction(createSchema, input, async (values) => {
    const accessToken = await requireAccessToken();
    const request = await revealRequestsApi.create(values.messageId, accessToken);

    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/requests");
    return request;
  });
}

/** PATCH /reveal-requests/:requestId/:decision */
const decideSchema = z.strictObject({
  requestId: mongoIdSchema,
  decision: z.enum(["approved", "rejected"]),
});

export async function decideRevealRequestAction(input: unknown) {
  return runAction(decideSchema, input, async (values) => {
    const accessToken = await requireAccessToken();
    const result = await revealRequestsApi.decide(
      values.requestId,
      values.decision,
      accessToken,
    );

    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard/conversations");
    return result;
  });
}
