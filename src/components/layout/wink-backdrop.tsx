import { WinkFace } from "@/components/brand/wink-face";

/**
 * The room the app lives in: a blackened-wine surface with one huge line-art
 * wink cropped off the bottom-right corner, tilted 12°, in crimson at 7%.
 *
 * Purely decorative and inert — no gradients, no blur, no glow.
 */
export function WinkBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <WinkFace className="absolute -bottom-[30vmin] -right-[26vmin] size-[118vmin] rotate-[12deg] text-crimson opacity-[0.07]" />
    </div>
  );
}
