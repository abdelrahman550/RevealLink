"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { WinkFace } from "@/components/brand/wink-face";

/**
 * The unlock moment, kept hard-edged and flat:
 *   1. the background wink opens its closed eye,
 *   2. the screen flashes solid crimson for a beat,
 *   3. a flat crimson shape wipes left-to-right to reveal the private chat.
 *
 * Under reduced motion it degrades to a single instant flash.
 */
export function UnlockOverlay({
  show,
  onDone,
}: {
  show: boolean;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => onDone?.(), reduced ? 120 : 1000);
    return () => window.clearTimeout(timer);
  }, [show, reduced, onDone]);

  if (!show) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
    >
      <div className="absolute inset-0 grid place-items-center">
        <WinkFace
          open
          animate={!reduced}
          className="size-[86vmin] -rotate-[12deg] text-crimson opacity-40"
        />
      </div>

      <div className="animate-flash absolute inset-0 bg-crimson" />

      {reduced ? null : (
        <div className="animate-wipe absolute inset-y-0 -left-full w-full bg-crimson" />
      )}
    </div>
  );
}
