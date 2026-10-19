"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Keeps list state (tab, filter, page) in the URL so a view is shareable,
 * survives reloads, and the back button behaves. Reads happen on both the
 * server and the client, so there is no hydration mismatch.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = React.useCallback(
    (
      updates: Record<string, string | number | null>,
      options?: { scroll?: boolean },
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, String(value));
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: options?.scroll ?? false,
      });
    },
    [pathname, router, searchParams],
  );

  return { searchParams, setParams };
}

/** Reads a positive integer param, falling back when absent or invalid. */
export function pageParam(
  searchParams: { get(key: string): string | null },
  key = "page",
): number {
  const raw = searchParams.get(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}
