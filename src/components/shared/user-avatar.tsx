import { cn, proxiedAssetUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({
  name,
  image,
  className,
  fallbackClassName,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const src = proxiedAssetUrl(image);

  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback name={name ?? undefined} className={cn(fallbackClassName)} />
    </Avatar>
  );
}

/**
 * Identity, still hidden.
 *
 * A solid crimson mask with one eye open and one eye winking — the motif that
 * runs through the whole product. No blur, no shimmer: the face is flat, and
 * it stops winking the moment the sender chooses to be revealed.
 */
export function MaskedAvatar({
  className,
  label = "Anonymous sender",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-crimson text-bone",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={9}
        strokeLinecap="round"
        className="size-[58%]"
        aria-hidden="true"
      >
        {/* open eye */}
        <circle cx="34" cy="40" r="6" fill="currentColor" stroke="none" />
        {/* winking eye */}
        <path d="M58 42 Q68 32 78 42" />
        {/* smirk */}
        <path d="M30 66 Q50 84 70 62" />
      </svg>
    </span>
  );
}
