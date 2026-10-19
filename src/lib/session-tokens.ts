import "server-only";

import { cookies } from "next/headers";
import { decode, encode } from "next-auth/jwt";

/**
 * Rewrites the Auth.js session cookie in place after a backend token rotation.
 *
 * Auth.js v5 renamed the cookie from `next-auth.session-token` to
 * `authjs.session-token`, and prefixes it with `__Secure-`/`__Host-` when it
 * runs over HTTPS. That same name doubles as the JWT salt, so both are
 * detected from the request rather than assumed.
 */

const AUTH_SECRET = process.env.AUTH_SECRET ?? "";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const COOKIE_CANDIDATES = [
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "__Host-next-auth.session-token",
  "next-auth.session-token",
] as const;

/** Finds the session cookie, tolerating Auth.js's chunked (`name.0`) layout. */
function resolveCookieName(store: CookieStore): string | undefined {
  const known = COOKIE_CANDIDATES.find(
    (candidate) => store.get(candidate)?.value ?? store.get(`${candidate}.0`)?.value,
  );
  if (known) return known;

  const discovered = store
    .getAll()
    .map((cookie) => cookie.name.replace(/\.\d+$/, ""))
    .find((name) => name.endsWith("session-token"));

  return discovered;
}

/** Reads a cookie value, rejoining the chunked parts Auth.js writes when large. */
function readCookieValue(store: CookieStore, name: string): string | undefined {
  const single = store.get(name)?.value;
  if (single) return single;

  const chunks: string[] = [];
  for (let index = 0; ; index += 1) {
    const part = store.get(`${name}.${index}`)?.value;
    if (part === undefined) break;
    chunks.push(part);
  }

  return chunks.length > 0 ? chunks.join("") : undefined;
}

export async function persistRotatedTokens(next: {
  accessToken: string;
  refreshToken: string;
}): Promise<boolean> {
  const store = await cookies();

  const name = resolveCookieName(store);
  if (!name) return false;

  const raw = readCookieValue(store, name);
  if (!raw) return false;

  const decoded = await decode({ token: raw, secret: AUTH_SECRET, salt: name });
  if (!decoded) return false;

  const encoded = await encode({
    token: {
      ...decoded,
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
    },
    secret: AUTH_SECRET,
    salt: name,
  });

  // Drop any stale chunked parts so they can't shadow the refreshed value.
  for (let index = 0; ; index += 1) {
    const chunkName = `${name}.${index}`;
    if (!store.get(chunkName)) break;
    store.delete(chunkName);
  }

  store.set(name, encoded, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: name.startsWith("__Secure") || name.startsWith("__Host"),
    maxAge: SESSION_MAX_AGE,
  });

  return true;
}
