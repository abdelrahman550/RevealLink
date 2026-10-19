"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Spinner({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <Loader2Icon className={cn("size-4 animate-spin text-muted-foreground", className)} aria-hidden="true" />
      <span className="sr-only">{label ?? "Loading…"}</span>
    </span>
  );
}

/** A Button that reports its own pending state and blocks double submits. */
export function SubmitButton({
  pending,
  children,
  pendingLabel,
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & {
  pending?: boolean;
  pendingLabel?: string;
}) {
  return (
    <Button
      type="submit"
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={className}
      {...props}
    >
      {pending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
