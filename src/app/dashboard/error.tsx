"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          That didn’t load properly.
        </h1>
        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-muted-foreground">
          Nothing you wrote was lost. Try again — or head back to your dashboard.
        </p>
        {error.digest ? (
          <p className="text-[12px] text-muted-foreground tnum" translate="no">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RefreshCcwIcon aria-hidden="true" />
          Try Again
        </Button>

        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
