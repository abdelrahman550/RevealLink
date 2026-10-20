"use client";

import * as React from "react";
import { toast } from "sonner";
import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";

import type { User } from "@/lib/api/types";
import { enable2FAAction, start2FAAction } from "@/actions/user.actions";
import { emailSchema, otpSchema } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "idle" | "code" | "enabled";

export function TwoFactorCard({
  user,
  twoStepVerification = user.twoStepVerification === true,
}: {
  user: User;
  twoStepVerification?: boolean;
}) {
  const [step, setStep] = React.useState<Step>("idle");
  const [email, setEmail] = React.useState(user.email);
  const [otp, setOtp] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const enabled = twoStepVerification || step === "enabled";

  const start = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await start2FAAction({ email: parsed.data });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setEmail(parsed.data);
    setStep("code");
    toast.success("We sent a verification code to your inbox.");
  };

  const confirm = async () => {
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await enable2FAAction({ email, otp: parsed.data });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setStep("enabled");
    toast.success("Two-step verification is on.");
  };

  if (enabled) {
    return (
      <div className="flat-tint flex items-start gap-3 rounded-2xl px-4 py-3.5">
        <ShieldCheckIcon
          className="mt-0.5 size-4 shrink-0 text-crimson"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-foreground">
            Two-step verification is enabled
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
            From now on, signing in emails a 6-digit code to{" "}
            <span className="text-foreground" translate="no">
              {email}
            </span>
            .
          </p>
          <Badge className="mt-3">End-to-end protected</Badge>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="space-y-5">
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          Enter the 6-digit code we emailed to{" "}
          <span className="text-foreground" translate="no">
            {email}
          </span>
          .
        </p>

        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            if (error) setError(null);
          }}
          pattern="^[0-9]+$"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Verification code"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {error ? (
          <p role="alert" className="text-[12.5px] text-crimson">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={() => void confirm()}
          >
            {pending ? "Verifying…" : "Turn on two-step verification"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setStep("idle");
              setOtp("");
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        Add a second step to sign-in: after your password, we email you a 6-digit code. Use
        the address below, or another you control.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="2fa-email" className="text-[13px] font-medium">
            Verification email
          </label>
          <Input
            id="2fa-email"
            type="email"
            value={email}
            autoComplete="email"
            spellCheck={false}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={pending}
          aria-busy={pending || undefined}
          onClick={() => void start()}
        >
          <KeyRoundIcon aria-hidden="true" />
          {pending ? "Sending…" : "Send code"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-[12.5px] text-crimson">
          {error}
        </p>
      ) : null}
    </div>
  );
}
