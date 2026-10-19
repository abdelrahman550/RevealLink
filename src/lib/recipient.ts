import { mongoIdSchema } from "@/lib/validation";

const MONGO_ID = /[0-9a-fA-F]{24}/;

/**
 * Pulls a recipient id out of whatever the visitor pasted — a full share link
 * (`…/send?to=<id>`), a copied fragment, or the bare id.
 *
 * There is no public user lookup, so the link (or the id) is the only handle on
 * who a message is for.
 */
export function extractRecipientId(value: string): string | null {
  const match = value.trim().match(MONGO_ID);
  if (!match) return null;

  const parsed = mongoIdSchema.safeParse(match[0]);
  return parsed.success ? parsed.data : null;
}
