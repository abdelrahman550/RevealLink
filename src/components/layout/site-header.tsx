import Link from "next/link";

import { auth } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#the-reveal", label: "The Reveal" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/#faq", label: "FAQ" },
];

export async function SiteHeader() {
  const session = await auth();
  const signedIn = Boolean(session?.accessToken);

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5 sm:gap-6 sm:px-8">
        <Logo wordmarkClassName="max-[359px]:hidden" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Site">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] text-muted-foreground transition-colors hover:text-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {signedIn ? (
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">
                  <span className="sm:hidden">Sign up</span>
                  <span className="hidden sm:inline">Create Your Link</span>
                </Link>
              </Button>
            </>
          )}

          <MobileNav links={NAV_LINKS} signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}
