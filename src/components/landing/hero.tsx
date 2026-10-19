import Link from "next/link";
import { ArrowRightIcon, LockIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { MaskedAvatar } from "@/components/shared/user-avatar";

const PREVIEW_MESSAGES = [
  {
    body: "The way you handled the review on Thursday — nobody else said it. Thank you.",
    time: "2 min ago",
    status: "anonymous",
  },
  {
    body: "I still have your book. I think about the inscription more than I should.",
    time: "1 hr ago",
    status: "requested",
  },
  {
    initials: "SK",
    body: "It was me. I’m glad I finally said it properly.",
    time: "Yesterday",
    status: "revealed",
  },
] as const;

const STATUS_LABEL: Record<(typeof PREVIEW_MESSAGES)[number]["status"], string> = {
  anonymous: "Anonymous",
  requested: "Reveal requested",
  revealed: "Identity revealed",
};

/** A still of the inbox: two veiled senders, one who chose to step forward. */
function InboxPreview() {
  return (
    <div className="relative">
      {/* Stacked-sheet depth — two hairlines offset behind the panel. */}
      <div
        aria-hidden="true"
        className="absolute -right-3 -top-3 h-full w-full rounded-2xl border border-border bg-bone/[0.04]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-1.5 -top-1.5 h-full w-full rounded-2xl border border-border bg-bone/[0.06]"
      />

      <div className="flat-card relative overflow-hidden rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex size-5 items-center justify-center rounded-full bg-bone/[0.08]">
            <LockIcon className="size-3 text-crimson" aria-hidden="true" />
          </span>
          <p className="truncate text-[11px] tracking-[0.02em] text-muted-foreground" translate="no">
            reveallink.app/inbox
          </p>
          <Badge variant="success" className="ml-auto">
            3 new
          </Badge>
        </div>

        <ul className="divide-y divide-border">
          {PREVIEW_MESSAGES.map((message) => (
            <li key={message.body} className="flex gap-3 px-4 py-4">
              {message.status === "revealed" ? (
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-crimson text-[10px] font-semibold tracking-[0.06em] text-bone"
                  aria-hidden="true"
                >
                  {message.initials}
                </span>
              ) : (
                <MaskedAvatar className="size-8" />
              )}

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-[13px] leading-relaxed text-foreground">
                  {message.body}
                </p>

                <div className="flex items-center gap-2">
                  <span className="label-caps text-muted-foreground">
                    {STATUS_LABEL[message.status]}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground/50">
                    ·
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum">
                    {message.time}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-5 pt-5 pb-10 sm:gap-10 sm:px-8 sm:pt-6 sm:pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-8 lg:pb-16">
        <div>
          <Reveal>
            <p className="label-caps flat-card inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-muted-foreground">
              <span className="size-1.5 rounded-full bg-crimson" aria-hidden="true" />
              Anonymous inbox
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-[2.75rem] font-bold leading-[1.03] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[4.25rem]">
              Say what you{" "}
              <span className="text-crimson">mean</span>.
              <br />
              Reveal only what you choose.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:mt-6">
              RevealLink gives you an inbox people can write to without a name attached.
              If you want to know who wrote it, you ask — and they decide. No guessing,
              no exposure, no accidental confessions.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create Your Link
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/send">Send a Message</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-12 grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-3">
              {[
                { term: "Anonymous by default", detail: "No account needed to write" },
                { term: "One request", detail: "Per message, and it expires quietly" },
                { term: "Two-step sign-in", detail: "Optional, on by request" },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="text-[13px] font-semibold text-foreground">{item.term}</dt>
                  <dd className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="mt-6 inline-flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <ShieldCheckIcon className="size-4 text-crimson" aria-hidden="true" />
              Your reveal history is yours alone. We never publish a leaderboard.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={20}>
          <InboxPreview />
        </Reveal>
      </div>
    </section>
  );
}
