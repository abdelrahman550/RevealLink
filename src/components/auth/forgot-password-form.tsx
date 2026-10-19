"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { forgotPasswordAction } from "@/actions/auth.actions";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/spinner";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    setFormError(null);

    const result = await forgotPasswordAction(values.email);
    setPending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    router.push(`/reset-password?email=${encodeURIComponent(result.data.email)}`);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Reset your password</h1>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          Enter the email on your account and we’ll send a 6-digit code to choose a
          new password.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormItem label="Email" error={form.formState.errors.email?.message} required>
          <Input
            {...form.register("email")}
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
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

        <SubmitButton className="w-full" pending={pending} pendingLabel="Sending code…">
          Send Reset Code
        </SubmitButton>
      </form>

      <p className="text-[12.5px] text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
