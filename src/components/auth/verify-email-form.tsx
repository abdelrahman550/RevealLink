"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MailCheckIcon } from "lucide-react";

import { confirmEmailAction, resendConfirmationAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SubmitButton } from "@/components/shared/spinner";
import { otpSchema } from "@/lib/validation";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code.");
      return;
    }

    setPending(true);
    setError(null);

    const result = await confirmEmailAction({ email, otp });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success("Email confirmed. You can sign in now.");
    router.replace(`/login?from=${encodeURIComponent("/dashboard")}`);
  };

  const onResend = async () => {
    setResending(true);
    const result = await resendConfirmationAction(email);
    setResending(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("A fresh code is on its way.");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="flex size-10 items-center justify-center rounded-full border text-accent">
          <MailCheckIcon className="size-[18px]" aria-hidden="true" />
        </span>

        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Confirm your email</h1>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="text-foreground" translate="no">
            {email}
          </span>
          . It expires in two minutes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="verify-otp" className="text-[13px] font-medium">
            Verification code
          </label>

          <InputOTP
            id="verify-otp"
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (error) setError(null);
            }}
            pattern="^[0-9]+$"
            autoComplete="one-time-code"
            inputMode="numeric"
            aria-invalid={error ? true : undefined}
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
        </div>

        <SubmitButton className="w-full" pending={pending} pendingLabel="Confirming…">
          Confirm Email
        </SubmitButton>
      </form>

      <div className="flex items-center justify-between text-[12.5px]">
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 text-muted-foreground"
          onClick={onResend}
          disabled={resending}
        >
          {resending ? "Sending…" : "Send a new code"}
        </Button>

        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          Sign in instead
        </button>
      </div>
    </div>
  );
}

/** Standalone email capture used when the confirmation page has no `email`. */
export function ResendConfirmationForm() {
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        const result = await resendConfirmationAction(email);
        setPending(false);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        toast.success("If that account exists, a code has been sent.");
      }}
      className="space-y-4"
    >
      <input
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        spellCheck={false}
        placeholder="you@example.com"
        aria-label="Email address"
        className="flex h-11 w-full rounded-full border border-input bg-bone/[0.06] px-4 py-1 text-sm transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-bone/30 focus-visible:border-crimson focus-visible:bg-bone/[0.07]  focus-visible:outline-none"
      />
      <SubmitButton className="w-full" pending={pending} pendingLabel="Sending…">
        Send Confirmation Code
      </SubmitButton>
    </form>
  );
}
