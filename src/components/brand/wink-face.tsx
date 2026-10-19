import { cn } from "@/lib/utils";

/**
 * The Wink — the signature motif.
 *
 * One eye is always open; the other is shut while the sender is anonymous.
 * When a reveal is approved the closed arc opens into a second eye, and the
 * whole face stops winking: identity unlocked.
 */
export function WinkFace({
  className,
  open = false,
  animate = false,
}: {
  className?: string;
  /** Both eyes open — the revealed state. */
  open?: boolean;
  /** Animate the eye opening rather than snapping (respects reduced motion). */
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="88" />

      {/* The eye that never closes. */}
      <circle cx="70" cy="82" r="7" fill="currentColor" stroke="none" />

      {/* The shut eye — a winking arc. */}
      <path
        d="M120 84 Q135 72 150 84"
        className={cn(
          animate && "transition-opacity duration-200",
          open ? "opacity-0" : "opacity-100",
        )}
      />

      {/* The same eye, open. */}
      <circle
        cx="135"
        cy="82"
        r="7"
        fill="currentColor"
        stroke="none"
        className={cn(
          animate && "transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <path d="M62 124 Q100 156 140 120" />
    </svg>
  );
}
