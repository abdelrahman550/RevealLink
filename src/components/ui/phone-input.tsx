import * as React from "react";

import { EGYPT_DIAL_CODE } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Egyptian mobile input with a fixed `+20` prefix.
 *
 * The field's value is only the national part; compose the full E.164 string
 * with `toE164EgyptPhone` before handing it to a server action.
 */
export function PhoneInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 flex select-none items-center text-sm text-muted-foreground"
      >
        {EGYPT_DIAL_CODE}
      </span>

      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        className={cn("pl-12", className)}
        {...props}
      />
    </div>
  );
}
