import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { APP_NAME } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#the-reveal", label: "The Reveal" },
      { href: "/send", label: "Send a Message" },
      { href: "/register", label: "Create Your Link" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Register" },
      { href: "/forgot-password", label: "Reset Password" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/#privacy", label: "Privacy Model" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#security", label: "Security" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t-[1.5px] border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              An anonymous inbox with a request-based identity reveal. The name is
              always the sender’s decision.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="space-y-3">
              <h2 className="label-caps text-muted-foreground">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-foreground/80 transition-colors hover:text-crimson"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="tnum">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p>
            Messages are stored on RevealLink’s servers. Reveal is always a choice.
          </p>
        </div>
      </div>
    </footer>
  );
}
