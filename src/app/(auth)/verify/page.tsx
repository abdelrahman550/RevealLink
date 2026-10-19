import type { Metadata } from "next";

import {
  ResendConfirmationForm,
  VerifyEmailForm,
} from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Confirm Your Email",
  description: "Enter the 6-digit code we sent to confirm your RevealLink account.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
            Resend your confirmation code
          </h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Enter the email you registered with and we’ll send a fresh 6-digit code.
          </p>
        </div>

        <ResendConfirmationForm />
      </div>
    );
  }

  return <VerifyEmailForm email={email} />;
}
