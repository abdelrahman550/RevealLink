import { CheckIcon, MoonIcon } from "lucide-react";

const SWATCHES = [
  { token: "Crimson", value: "#DC143C" },
  { token: "Bone", value: "#F6EDE8" },
  { token: "Room", value: "#0C0508" },
] as const;

/**
 * The theme is not a choice here — a black room lit crimson is the whole
 * identity, and a light variant would wash it out. So this card explains
 * rather than offers.
 */
export function AppearanceCard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-crimson/40 bg-crimson/12 px-4 py-3.5">
        <MoonIcon className="size-4 shrink-0 text-crimson" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-foreground">Black Room</p>
          <p className="text-[11.5px] text-muted-foreground">
            The only theme. Crimson light, bone text.
          </p>
        </div>

        <CheckIcon className="size-4 shrink-0 text-crimson" aria-hidden="true" />
      </div>

      <ul className="flex flex-wrap items-center gap-3" aria-label="Palette">
        {SWATCHES.map((swatch) => (
          <li key={swatch.token} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-[1.5px] border-bone/20"
              style={{ backgroundColor: swatch.value }}
            />
            <span className="label-caps text-muted-foreground">{swatch.token}</span>
          </li>
        ))}
      </ul>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Three colours, no gradients, no glow. Hidden things stay crimson-tinted;
        revealed things open both eyes. A bright theme would break that language,
        so there isn&apos;t one.
      </p>
    </div>
  );
}
