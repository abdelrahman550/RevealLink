import { type NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days — attachment paths are content-addressed

/**
 * Streams backend attachments (`assets/messages/*.png`, profile images, …)
 * through the Next.js origin so the browser never contacts the API host.
 */
async function serveAsset(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;

  // Tolerate callers that pass the backend's own `assets/` prefix through.
  const clean = segments[0] === "assets" ? segments.slice(1) : segments;
  const path = clean.join("/").replace(/\.\./g, "");

  if (!path) return new NextResponse(null, { status: 404 });

  const upstream = await fetch(`${API_URL}/assets/${path}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    return new NextResponse(null, { status: upstream?.status ?? 502 });
  }

  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "Cache-Control": `private, max-age=${MAX_AGE}`,
    "X-Content-Type-Options": "nosniff",
  });

  const etag = upstream.headers.get("etag");
  if (etag) headers.set("ETag", etag);

  if (request.headers.get("if-none-match") === etag && etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  return new NextResponse(upstream.body, { status: 200, headers });
}

export { serveAsset as GET, serveAsset as HEAD };
