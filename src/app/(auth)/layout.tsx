import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.accessToken) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,44%)]">
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Logo />
        </header>

        <main
          id="main"
          className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8"
        >
          <div className="w-full max-w-sm">{children}</div>
        </main>

        <footer className="px-5 py-5 text-[12px] text-muted-foreground sm:px-8">
          <Link href="/" className="transition-colors hover:text-crimson">
            ← Back to {APP_NAME}
          </Link>
        </footer>
      </div>

      {/* Editorial side panel — hidden where it would only take up room. */}
      <aside className="relative hidden overflow-hidden border-l-[1.5px] border-border bg-bone/[0.03] lg:block">
        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="label-caps text-muted-foreground">A note on anonymity</p>

          <blockquote className="max-w-md">
            <p className="font-display text-3xl font-bold leading-[1.18] tracking-[-0.03em] text-foreground">
              “The message arrives without a name. What you do with that is the
              only decision that matters.”
            </p>
            <footer className="mt-6 text-[13px] text-muted-foreground">
              — The premise behind {APP_NAME}
            </footer>
          </blockquote>

          <dl className="grid grid-cols-2 gap-6 border-t border-border pt-6">
            <div>
              <dt className="label-caps text-muted-foreground">Reveals</dt>
              <dd className="mt-1.5 text-[13px] text-foreground">Always a request</dd>
            </div>
            <div>
              <dt className="label-caps text-muted-foreground">Decisions</dt>
              <dd className="mt-1.5 text-[13px] text-foreground">Always the sender’s</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
