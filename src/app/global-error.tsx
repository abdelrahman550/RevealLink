"use client";

import { RefreshCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import "@/app/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em]">
            RevealLink failed to load.
          </h1>
          <p className="text-sm text-muted-foreground">
            The application shell could not start. Reloading is the safest next step.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground tnum" translate="no">
              Reference: {error.digest}
            </p>
          ) : null}
          <Button onClick={reset}>
            <RefreshCcwIcon aria-hidden="true" />
            Reload
          </Button>
        </div>
      </body>
    </html>
  );
}
