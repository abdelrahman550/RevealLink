import Link from "next/link";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

/**
 * The mark: the Wink, flat and solid — a crimson tile with one open eye and
 * one closed. It is the same face that watches from the background, and it
 * stops winking when a reveal is approved.
 */
export function Logo({
  className,
  showWordmark = true,
  wordmarkClassName,
  href = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  href?: string | null;
}) {
  const mark = (
    <span className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
        aria-hidden="true"
        fill="none"
      >
        <rect width="32" height="32" rx="9" fill="var(--crimson)" />

        {/* open eye */}
        <circle cx="11.5" cy="13" r="2" fill="var(--bone)" />

        {/* winking eye */}
        <path
          d="M18 13.5Q20.5 11 23 13.5"
          stroke="var(--bone)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* smirk */}
        <path
          d="M10.5 20.5Q16.5 25.5 23 19.5"
          stroke="var(--bone)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark ? (
        <span
          translate="no"
          className={cn(
            "font-display text-[16px] font-extrabold tracking-[-0.03em] text-bone",
            wordmarkClassName,
          )}
        >
          {APP_NAME}
        </span>
      ) : null}
    </span>
  );

  if (!href) return <span className={cn("inline-flex", className)}>{mark}</span>;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex rounded-xl transition-opacity hover:opacity-85",
        className,
      )}
      aria-label={`${APP_NAME} home`}
    >
      {mark}
    </Link>
  );
}
