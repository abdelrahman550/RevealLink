import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The single heading pattern every dashboard view shares: a small tracked
 * eyebrow, a display-serif title, an optional one-line brief, and a slot for
 * page-level actions.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? <p className="label-caps text-muted-foreground">{eyebrow}</p> : null}

        <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-[28px] sm:leading-tight">
          {title}
        </h1>

        {description ? (
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}
