"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetPasswordAction, verifyForgotPasswordAction } from "@/actions/auth.actions";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SubmitButton } from "@/components/shared/spinner";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation";

/**
 * Two-phase reset: verify the emailed code first (POST /auth/verify-forgot-password),
 * then submit the new password (PATCH /auth/reset-forgot-password). The backend
 * requires both calls to carry the code, so it stays in the form state.
 */
export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [verified, setVerified] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { errors } = form.formState;

  const onVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    const email = form.getValues("email");
    const parsed = resetPasswordSchema.shape.otp.safeParse(otp);

    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code.");
      return;
    }

    setVerifying(true);
    setOtpError(null);

    const result = await verifyForgotPasswordAction({ email, otp });
    setVerifying(false);

    if (!result.ok) {
      setOtpError(result.message);
      return;
    }

    form.setValue("otp", otp);
    setVerified(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    setFormError(null);

    const result = await resetPasswordAction(values);
    setPending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    toast.success("Password updated. Sign in with your new password.");
    router.replace("/login");
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          {verified ? "Choose a new password" : "Enter your reset code"}
        </h1>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          {verified
            ? "Pick something you haven’t used here before."
            : "We sent a 6-digit code to the address on your account."}
        </p>
      </div>

      {!verified ? (
        <form onSubmit={onVerify} className="space-y-5">
          <FormItem label="Email" error={errors.email?.message} required>
            <Input
              {...form.register("email")}
              type="email"
              name="email"
              autoComplete="email"
              spellCheck={false}
            />
          </FormItem>

          <div className="space-y-2">
            <label htmlFor="reset-otp" className="text-[13px] font-medium">
              Reset code
            </label>

            <InputOTP
              id="reset-otp"
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (otpError) setOtpError(null);
              }}
              pattern="^[0-9]+$"
              autoComplete="one-time-code"
              inputMode="numeric"
              aria-invalid={otpError ? true : undefined}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {otpError ? (
              <p role="alert" className="text-[12.5px] text-crimson">
                {otpError}
              </p>
            ) : null}
          </div>

          <SubmitButton className="w-full" pending={verifying} pendingLabel="Verifying…">
            Verify Code
          </SubmitButton>
        </form>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormItem
            label="New password"
            error={errors.password?.message}
            hint={PASSWORD_REQUIREMENTS}
            required
          >
            <Input
              {...form.register("password")}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="New password"
            />
          </FormItem>

          <FormItem
            label="Confirm new password"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              {...form.register("confirmPassword")}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
          </FormItem>

          {formError ? (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-xl border-[1.5px] border-crimson/40 bg-crimson/12 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-crimson"
            >
              {formError}
            </p>
          ) : null}

          <SubmitButton className="w-full" pending={pending} pendingLabel="Updating…">
            Update Password
          </SubmitButton>
        </form>
      )}

      <p className="text-[12.5px] text-muted-foreground">
        <Link
          href="/forgot-password"
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          Use a different email
        </Link>
      </p>
    </div>
  );
}
