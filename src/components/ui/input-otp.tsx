"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One-time-code field built on `input-otp`, which handles paste, arrow-key
 * movement, and `autocomplete="one-time-code"` for us.
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-[:disabled]:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext?.slots[index];

  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot?.isActive || undefined}
      className={cn(
        "relative flex h-12 w-11 items-center justify-center rounded-xl border-[1.5px] border-input bg-bone/[0.05] text-lg font-semibold transition-[border-color,background-color] duration-150 tnum",
        "data-[active=true]:z-10 data-[active=true]:border-crimson data-[active=true]:bg-bone/[0.08]",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      {slot?.char ?? (slot?.hasFakeCaret ? null : <MinusIcon className="size-3.5 text-border" aria-hidden="true" />)}

      {slot?.hasFakeCaret ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="h-5 w-px animate-pulse bg-foreground" />
        </span>
      ) : null}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div role="separator" aria-hidden="true" className="text-muted-foreground" {...props}>
      <MinusIcon className="size-4" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
