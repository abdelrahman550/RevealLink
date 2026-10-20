"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Tries the async Clipboard API first, then falls back to the legacy
 * `execCommand("copy")` path used by older Safari and by browsers that deny
 * `clipboard-write` (the password is written to a transient textarea, never
 * to a password input).
 */
async function writeToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
  }

  const previousFocus = document.activeElement as HTMLElement | null;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  try {
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    previousFocus?.focus();
  }
}

/**
 * Browsers refuse to copy from a masked `type="password"` field — the `copy`
 * event never fires, so Ctrl+C silently leaves the previous clipboard contents
 * in place. This button is the explicit way to put the current value on the
 * clipboard (the same thing the user gets after revealing the field).
 *
 * Note: the password stays on the clipboard until something replaces it.
 */
export function CopyPasswordButton({
  getValue,
  className,
}: {
  getValue: () => string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const value = getValue();
    if (!value) return;

    if (await writeToClipboard(value)) {
      setCopied(true);
      return;
    }

    toast.error("Couldn’t copy the password. Reveal it and copy it manually.");
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={copied ? "Password copied" : "Copy password"}
      className={cn(
        "rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      {copied ? (
        <CheckIcon className="size-4" aria-hidden="true" />
      ) : (
        <CopyIcon className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Password copied" : ""}
      </span>
    </button>
  );
}
