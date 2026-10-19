"use client";

import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const DEFAULT_MESSAGE =
  "We couldn’t load this. Check your connection and try again.";

type QueryErrorLike = {
  status?: unknown;
  data?: { message?: string } | undefined;
};

/**
 * Turns an RTK Query error into something a person can act on, instead of the
 * generic "check your connection" message (which hides rate limits, expired
 * sessions and backend faults alike).
 */
export function queryErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const { status, data } = error as QueryErrorLike;

  if (status === 429) {
    return "The server is receiving too many requests right now. Give it a moment, then try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 404) return undefined;

  if (data?.message) return data.message;

  if (typeof status === "number" && status >= 500) {
    return "Something went wrong on our side. Please try again in a moment.";
  }

  return undefined;
}

/** Inline error with a retry affordance for failed queries. */
export function QueryError({
  message,
  error,
  onRetry,
  className,
}: {
  message?: string;
  /** The RTK Query `error`; used when `message` is not given. */
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const resolved = message ?? queryErrorMessage(error) ?? DEFAULT_MESSAGE;

  return (
    <div
      role="alert"
      className={
        className ??
        "flex flex-col items-start gap-3 rounded-2xl border-[1.5px] border-crimson/40 bg-crimson/12 p-5"
      }
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangleIcon
          className="mt-0.5 size-4 shrink-0 text-crimson"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-foreground">{resolved}</p>
      </div>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcwIcon aria-hidden="true" />
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
