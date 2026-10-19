import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side session accessors.
 *
 * `auth()` decodes the Auth.js JWT cookie — it performs no network I/O, so it
 * is safe to call from layouts, server components, and route handlers alike.
 */

export const getSession = cache(async () => auth());

export async function getAccessToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

/** Redirects to /login when unauthenticated. Use inside protected layouts. */
export async function requireSession() {
  const session = await auth();
  if (!session?.accessToken) {
    redirect("/login");
  }
  return session;
}
