"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { registerAction } from "@/actions/auth.actions";
import { GoogleButton } from "@/components/auth/google-button";
import { SubmitButton } from "@/components/shared/spinner";
import { FormItem } from "@/components/ui/form";
import { CopyPasswordButton } from "@/components/ui/copy-password-button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants";
import { sanitizeEgyptPhoneInput, toE164EgyptPhone } from "@/lib/phone";
import { registerFormSchema, type RegisterValues } from "@/lib/validation";

const GENDERS = [
  { value: 0, label: "Male" },
  { value: 1, label: "Female" },
] as const satisfies readonly { value: RegisterValues["gender"]; label: string }[];

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [revealPassword, setRevealPassword] = React.useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      DOB: "",
      gender: 0,
    },
  });

  const { errors } = form.formState;

  // Registered once so the normalising onChange can still call RHF's handler.
  const phoneField = form.register("phone");

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    setFormError(null);

    const result = await registerAction({
      ...values,
      phone: toE164EgyptPhone(values.phone),
    });
    setPending(false);

    if (!result.ok) {
      setFormError(result.message);
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        if (field in values) {
          form.setError(field as keyof RegisterValues, { type: "server", message });
        }
      }
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(result.data.email)}`);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Create your link</h1>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          One account, one inbox. You’ll confirm your email with a code before
          signing in.
        </p>
      </div>

      <GoogleButton label="Sign up with Google" />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormItem
          label="Full name"
          error={errors.userName?.message}
          hint="Shown to people you allow to see your identity."
          required
        >
          <Input
            {...form.register("userName")}
            name="userName"
            autoComplete="name"
            placeholder="Ada Lovelace"
          />
        </FormItem>

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
          label="Phone"
          error={errors.phone?.message}
          hint="Egyptian mobile number — we add the +20 for you."
          required
        >
          <PhoneInput
            {...phoneField}
            onChange={(event) => {
              event.target.value = sanitizeEgyptPhoneInput(event.target.value);
              void phoneField.onChange(event);
            }}
            name="phone"
            placeholder="1012345678"
          />
        </FormItem>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormItem label="Date of birth" error={errors.DOB?.message} required>
            <Input
              {...form.register("DOB")}
              type="date"
              name="DOB"
              autoComplete="bday"
              max={new Date().toISOString().slice(0, 10)}
            />
          </FormItem>

          <fieldset className="grid gap-1.5">
            <legend className="text-[13px] font-medium">
              Gender
              <span className="ml-0.5 text-crimson" aria-hidden="true">
                *
              </span>
            </legend>

            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        ref={field.ref}
                        className="peer sr-only"
                      />
                      <span className="flex h-11 items-center justify-center rounded-xl border border-input text-sm transition-colors peer-checked:border-crimson peer-checked:bg-crimson/10 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />

            {errors.gender ? (
              <p role="alert" className="text-[12.5px] text-crimson">
                {errors.gender.message}
              </p>
            ) : null}
          </fieldset>
        </div>

        <FormItem
          label="Password"
          error={errors.password?.message}
          hint={PASSWORD_REQUIREMENTS}
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
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="pr-16"
          />
        </FormItem>

        <FormItem
          label="Confirm password"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            {...form.register("confirmPassword")}
            type={revealPassword ? "text" : "password"}
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

        <SubmitButton className="w-full" pending={pending} pendingLabel="Creating your link…">
          Create Account
        </SubmitButton>
      </form>

      <p className="text-[12.5px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
