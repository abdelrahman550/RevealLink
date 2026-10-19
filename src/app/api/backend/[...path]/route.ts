import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { API_URL } from "@/lib/api/client";
import { usersApi } from "@/lib/api/endpoints";
import { persistRotatedTokens } from "@/lib/session-tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Backend-for-frontend proxy.
 *
 * The browser talks to `/api/backend/*` and never to the API directly. That
 * keeps bearer tokens off the client, sidesteps the backend's strict CORS
 * allow-list, and gives us a single place to transparently refresh an expired
 * access token before the request is retried.
 */

/**
 * We build the outbound header set from scratch rather than copying the
 * browser's, so cookies and hop-specific headers never leak through. The one
 * exception is the client IP: the backend's rate limiter partitions on it, and
 * without it every request arrives from the Next.js server's IP, collapsing all
 * users into a single bucket.
 */
async function forward(
  request: NextRequest,
  path: string,
  accessToken?: string,
): Promise<Response> {
  const target = `${API_URL}/${path}${request.nextUrl.search}`;

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const headers = new Headers();
  headers.set("Accept", request.headers.get("accept") ?? "application/json");
  headers.set("Accept-Language", "0");
  headers.set("ngrok-skip-browser-warning", "true");

  // Preserve the real client IP so the backend can partition per caller.
  // Browsers cannot set this header, and Vercel (or `next dev`) populates it on
  // the incoming request, so the first hop is the actual client address.
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  // Multer needs the exact multipart boundary, so pass the type through as-is.
  if (hasBody) {
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
  }

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (hasBody) {
    init.body = request.body;
    // Required by Node's fetch when streaming a request body.
    init.duplex = "half";
  }

  return fetch(target, init);
}

/** Copies the backend JSON envelope back to the client verbatim. */
async function relay(response: Response): Promise<NextResponse> {
  const text = await response.text();

  const headers = new Headers({
    "Content-Type": response.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  });

  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) headers.set("Retry-After", retryAfter);

  return new NextResponse(text, { status: response.status, headers });
}

async function tryRefresh(session: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<{ accessToken: string; refreshToken: string } | null> {
  if (!session.refreshToken) return null;

  try {
    const rotated = await usersApi.rotateToken(session.refreshToken);
    const tokens = {
      accessToken: rotated.access_token,
      refreshToken: rotated.refresh_token,
    };

    const persisted = await persistRotatedTokens(tokens);
    return persisted ? tokens : null;
  } catch {
    return null;
  }
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const path = segments.join("/");

  if (!path) {
    return NextResponse.json({ message: "Not found.", status: 404 }, { status: 404 });
  }

  const session = await auth();
  const accessToken = session?.accessToken;

  let response = await forward(request, path, accessToken);

  // Expired access token → rotate & retry once with the fresh credentials.
  if (response.status === 401 && session?.refreshToken) {
    const rotated = await tryRefresh(session);
    if (rotated) {
      // Drain the body so the socket can be reused.
      await response.body?.cancel().catch(() => undefined);
      response = await forward(request, path, rotated.accessToken);
    }
  }

  return relay(response);
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
