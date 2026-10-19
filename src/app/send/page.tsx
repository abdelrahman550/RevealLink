import type { Metadata } from "next";
import { ShieldCheckIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PublicSend } from "@/components/messages/public-send";
import { RecipientPrompt } from "@/components/messages/recipient-prompt";
import { mongoIdSchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Send an anonymous message",
  description:
    "Write an anonymous message to a RevealLink inbox. Your name stays hidden until you choose to reveal it.",
  robots: { index: false, follow: false },
};

export default async function SendPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.to) ? params.to[0] : params.to;
  const parsed = raw ? mongoIdSchema.safeParse(raw) : null;
  const receiverId = parsed?.success ? parsed.data : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
      </header>

      <main id="main" className="flex flex-1 items-start justify-center px-5 pb-16 sm:px-8">
        <div className="grid w-full max-w-4xl gap-10 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14 lg:py-12">
          <div className="space-y-6 lg:sticky lg:top-12">
            <p className="label-caps text-muted-foreground">Anonymous by default</p>

            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
              Say the thing you’ve been{" "}
              <span className="text-crimson">holding back.</span>
            </h1>

            <p className="max-w-md text-[14px] leading-relaxed text-muted-foreground">
              Whatever you write is delivered without your name. If they ever want to know
              who you are, they’ll have to ask — and you’ll get to say yes or no.
            </p>

            <ul className="space-y-3 border-t border-border pt-6">
              {[
                "No account needed to send.",
                "Attach up to three images.",
                "Your identity is released only with your consent.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-crimson" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="flat-card rounded-2xl p-5 shadow-lg sm:p-6">
            {receiverId ? (
              <PublicSend receiverId={receiverId} />
            ) : (
              <RecipientPrompt invalidLink={Boolean(raw)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
