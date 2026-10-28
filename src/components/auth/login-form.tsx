"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, LockIcon } from "lucide-react";

import { loginAction, verify2FALoginAction } from "@/actions/auth.actions";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { loginSchema, otpSchema, type LoginValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem } from "@/components/ui/form";
import { CopyPasswordButton } from "@/components/ui/copy-password-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SubmitButton } from "@/components/shared/spinner";
import { GoogleButton } from "@/components/auth/google-button";

type Step = { name: "credentials" } | { name: "otp"; email: string };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [step, setStep] = React.useState<Step>({ name: "credentials" });
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [revealPassword, setRevealPassword] = React.useState(false);

  const redirectTo = searchParams.get("from") ?? "/dashboard";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { errors } = form.formState;

  const finish = React.useCallback(() => {
    dispatch(api.util.resetApiState());
    toast.success("Signed in");
    router.replace(redirectTo);
    router.refresh();
  }, [dispatch, redirectTo, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    setFormError(null);

    const result = await loginAction(values);
    setPending(false);

    if (!result.ok) {
      setFormError(result.message);
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        if (field === "email" || field === "password") {
          form.setError(field, { type: "server", message });
        }
      }
      return;
    }

    if (result.data.requires2FA) {
      setStep({ name: "otp", email: result.data.email });
      return;
    }

    finish();
  });

  const onVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step.name !== "otp") return;

    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code.");
      return;
    }

    setPending(true);
    setOtpError(null);

    const result = await verify2FALoginAction({ email: step.email, otp });
    setPending(false);

    if (!result.ok) {
      setOtpError(result.message);
      return;
    }

    finish();
  };

  if (step.name === "otp") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Check your inbox</h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Two-step verification is on for{" "}
            <span className="text-foreground" translate="no">
              {step.email}
            </span>
            . Enter the 6-digit code we just sent.
          </p>
        </div>

        <form onSubmit={onVerify} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="login-otp" className="text-[13px] font-medium">
              Verification code
            </label>

            <InputOTP
              id="login-otp"
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

          <SubmitButton className="w-full" pending={pending} pendingLabel="Verifying…">
            Verify &amp; Sign In
          </SubmitButton>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep({ name: "credentials" });
              setOtp("");
              setOtpError(null);
            }}
          >
            <ArrowLeftIcon aria-hidden="true" />
            Use a different account
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-crimson/40 bg-crimson/12 text-crimson">
          {pending ? (
            <KeyRoundIcon className="size-4" aria-hidden="true" />
          ) : (
            <LockIcon className="size-4" aria-hidden="true" />
          )}
        </span>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Welcome back</h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Sign in to read what people have been meaning to tell you.
          </p>
        </div>
      </div>

      <GoogleButton label="Sign in with Google" />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormItem label="Email" error={errors.email?.message} required>
          <Input
            {...form.register("email")}
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
          />
        </FormItem>

        <FormItem
          label="Password"
          error={errors.password?.message}
          required
          addon={
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
              <CopyPasswordButton getValue={() => form.getValues("password")} />
              <button
                type="button"
                onClick={() => setRevealPassword((value) => !value)}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={revealPassword ? "Hide password" : "Show password"}
                aria-pressed={revealPassword}
              >
                {revealPassword ? (
                  <EyeOffIcon className="size-4" aria-hidden="true" />
                ) : (
                  <EyeIcon className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          }
        >
          <Input
            {...form.register("password")}
            type={revealPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            className="pr-16"
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

        <SubmitButton className="w-full" pending={pending} pendingLabel="Signing in…">
          Sign In
        </SubmitButton>
      </form>

      <div className="space-y-4">
        <Link
          href="/forgot-password"
          className="block text-[12.5px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Forgot your password?
        </Link>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <span className="label-caps text-muted-foreground">
            New to RevealLink
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/register">Create your account</Link>
        </Button>
      </div>
    </div>
  );
}
