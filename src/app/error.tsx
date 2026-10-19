"use client";

import * as React from "react";
import { RefreshCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the failure for observability without leaking it to the user.
    console.error("Unhandled UI error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Something broke on our side.
        </h1>
        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-muted-foreground">
          Your data is untouched. Retrying usually clears it — if it doesn’t,
          the issue is ours to fix.
        </p>
        {error.digest ? (
          <p className="text-[12px] text-muted-foreground tnum" translate="no">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>

      <Button onClick={reset}>
        <RefreshCcwIcon aria-hidden="true" />
        Try Again
      </Button>
    </div>
  );
}
