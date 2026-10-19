import "server-only";

import { z } from "zod";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";

/**
 * Minimal, dependency-free wrapper around Server Actions.
 *
 * Every action returns the same discriminated union so client code can branch
 * on `ok` without try/catch, and field-level Zod issues arrive in a shape the
 * forms can render directly.
 */

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      fieldErrors: Record<string, string>;
      code?: string;
    };

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !(key in map)) map[key] = issue.message;
  }
  return map;
}

/** Throws a 401 ApiError when the caller has no live session. */
export async function requireAccessToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new ApiError({
      message: "Your session has expired. Please sign in again.",
      statusCode: 401,
      kind: "fail",
    });
  }
  return session.accessToken;
}

export async function runAction<TInput extends z.ZodType, TOutput>(
  schema: TInput,
  input: unknown,
  handler: (values: z.infer<TInput>) => Promise<TOutput>,
): Promise<ActionResult<TOutput>> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      code: "VALIDATION_ERROR",
    };
  }

  try {
    const data = await handler(parsed.data);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
        code: error.kind,
      };
    }

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      fieldErrors: {},
    };
  }
}
