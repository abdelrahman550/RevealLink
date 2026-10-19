"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, LinkIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

/**
 * The public entry point for a person's anonymous inbox.
 *
 * There is no user-search endpoint, so the shareable artefact *is* the link:
 * `/send?to=<userId>`. Anyone holding it can write to that inbox without an
 * account of their own.
 */
export function ShareLink({
  userId,
  compact = false,
  className,
}: {
  userId: string;
  compact?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const path = `/send?to=${userId}`;
  const fullUrl = `${APP_URL}${path}`;
  const displayUrl = fullUrl.replace(/^https?:\/\//, "");

  const copy = React.useCallback(async () => {
    const url =
      typeof window === "undefined" ? fullUrl : `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn’t copy automatically — select the link and copy it manually.");
    }
  }, [fullUrl, path]);

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-bone/[0.06] transition-[border-color,box-shadow] focus-within:border-crimson ",
          className,
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <LinkIcon className="size-3.5 shrink-0 text-crimson" aria-hidden="true" />

          <p
            className="min-w-0 flex-1 truncate font-sans text-[11.5px] text-muted-foreground"
            title={fullUrl}
          >
            {displayUrl}
          </p>

          <button
            type="button"
            onClick={copy}
            aria-label="Copy your message link"
            className={cn(
              "shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors",
              "hover:bg-bone/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-crimson" aria-hidden="true" />
            ) : (
              <CopyIcon className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className={cn("flat-card rounded-2xl p-5 shadow-lg", className)}>
      <div className="flex flex-col gap-1">
        <p className="label-caps text-muted-foreground">Your message link</p>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          Share this anywhere. Anything sent through it arrives unsigned — until you ask
          who sent it.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-bone/[0.06] px-4">
          <LinkIcon className="size-4 shrink-0 text-crimson" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate py-2.5 font-sans text-[12px] text-foreground/85">
            {displayUrl}
          </span>
        </div>

        <div className="flex gap-2">
          <Button type="button" onClick={copy} className="flex-1 sm:flex-none">
            {copied ? (
              <CheckIcon aria-hidden="true" />
            ) : (
              <CopyIcon aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <a href={path} target="_blank" rel="noreferrer">
              <SendIcon aria-hidden="true" />
              Open
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
