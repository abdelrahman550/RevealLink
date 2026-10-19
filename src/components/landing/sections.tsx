import Link from "next/link";
import {
  ArrowRightIcon,
  BellOffIcon,
  EyeOffIcon,
  ImageIcon,
  KeyRoundIcon,
  MessagesSquareIcon,
  MousePointerClickIcon,
  UserCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="max-w-2xl scroll-mt-24">
      <p className="label-caps text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Share one link",
    body: "Your RevealLink address is the only thing anyone needs. No profile, no bio, no follower count to perform for.",
  },
  {
    number: "02",
    title: "Read without pressure",
    body: "Messages land in your inbox with the sender hidden. Attachments included, if they had something to show you.",
  },
  {
    number: "03",
    title: "Ask, don’t guess",
    body: "Curious? Request an identity reveal on a single message. One request per message, and you’ll know the answer.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionHeading
            id="how-it-works"
            eyebrow="How It Works"
            title="Three steps, and only one of them is yours to control."
            description="RevealLink separates the writing from the naming. That separation is the whole product."
          />
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <StaggerItem key={step.number}>
              <div className="border-t border-border pt-6">
                <p className="text-crimson font-display text-4xl font-bold leading-none tnum">
                  {step.number}
                </p>
                <h3 className="mt-5 text-[15px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: EyeOffIcon,
    title: "Anonymous by default",
    body: "Senders stay unnamed unless they agree to be named. Signing in is optional, not a loophole.",
  },
  {
    icon: MousePointerClickIcon,
    title: "One reveal, one message",
    body: "A reveal request is scoped to a single message and can’t be reused, batched, or replayed.",
  },
  {
    icon: MessagesSquareIcon,
    title: "A private thread if you both want one",
    body: "Approving a reveal opens a two-person conversation. Declining ends it, respectfully.",
  },
  {
    icon: ImageIcon,
    title: "Attachments that stay put",
    body: "Up to three images per message, stored privately and only readable by the two accounts involved.",
  },
  {
    icon: KeyRoundIcon,
    title: "Two-step verification",
    body: "Turn it on from Settings and every sign-in needs a six-digit code sent to your inbox.",
  },
  {
    icon: BellOffIcon,
    title: "No engagement machinery",
    body: "No likes, no streaks, no notifications engineered to pull you back. Read it and leave.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="What You Get"
            title="Built for the message, not the metrics."
          />
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="flex gap-3.5">
                <span className="flat-card mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-crimson shadow-sm">
                  <feature.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

export function TheReveal() {
  return (
    <section className="border-t border-border bg-crimson/[0.05]">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionHeading
            id="the-reveal"
            eyebrow="The Reveal"
            title="The name is the sender’s decision, every single time."
            description="When you request a reveal, the other person sees the message you’re asking about — nothing else about you, and no deadline that pressures them."
          />

          <ul className="mt-8 space-y-4">
            {[
              "Approve and a private conversation opens between the two of you.",
              "Decline and the message stays exactly as it arrived, anonymously.",
              "Either way, the request is closed. It can’t be asked again.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-[13.5px] leading-relaxed">
                <UserCheckIcon className="mt-0.5 size-4 shrink-0 text-crimson" aria-hidden="true" />
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} y={20}>
          <div
            className="flat-card rounded-2xl p-5 shadow-lg sm:p-6"
            aria-hidden="true"
          >
            <p className="label-caps text-muted-foreground">Reveal request</p>

            <blockquote className="mt-4 border-l-2 border-crimson/50 pl-4 font-display text-lg font-semibold leading-snug text-foreground">
              “I still have your book. I think about the inscription more than I
              should.”
            </blockquote>

            <p className="mt-4 text-[12.5px] text-muted-foreground tnum">
              Requested 12 minutes ago · 1 of 1
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex h-10 items-center rounded-full bg-crimson px-5 font-display text-[12.5px] font-semibold text-bone shadow-[3px_3px_0_var(--crimson)]">
                Reveal Myself
              </span>
              <span className="inline-flex h-10 items-center rounded-full border-[1.5px] border-bone/45 px-5 font-display text-[12.5px] font-semibold text-bone">
                Stay Hidden
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Privacy() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionHeading
            id="privacy"
            eyebrow="Privacy"
            title="Honest about what anonymity can and cannot promise."
            description="Anonymous to the person reading it — not anonymous to the service that stores it. That distinction matters, so we state it plainly."
          />
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {[
            {
              title: "Anonymous to readers",
              body: "Nothing about the sender is exposed in your inbox. Not an email, not an avatar, not a hint.",
            },
            {
              title: "Identifiable to the service",
              body: "Messages are stored on RevealLink’s servers alongside a sender reference. Anonymity is a product feature, not a security guarantee.",
            },
            {
              title: "Reveal is reversible",
              body: "Approving a reveal exposes a first name, last name and avatar to you — never your address book, and never to anyone else.",
            },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="border-t border-border pt-6">
                <h3 className="text-[14.5px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal>
          <div className="flat-card mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-[13px] text-muted-foreground">
              Transport encryption, hashed credentials, rotating tokens, and optional
              two-step verification are on for everyone.
            </p>
            <Button variant="link" size="sm" asChild className="ml-auto px-0">
              <Link href="/register">
                Create your link
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  {
    question: "Do people need an account to write to me?",
    answer:
      "No. Anonymous messages can be sent without signing in — that is the default way RevealLink is used. Signed-in senders get the same anonymity until they approve a reveal.",
  },
  {
    question: "What happens to a message after I decline a reveal?",
    answer:
      "Nothing changes. The message stays in your inbox exactly as it arrived, still anonymous, and the request is closed for good. You cannot ask again for that message.",
  },
  {
    question: "Can someone reveal me without my permission?",
    answer:
      "No. Every reveal is initiated as a request and decided by the person who sent the message. Approving opens a private conversation with the other person; declining ends the exchange.",
  },
  {
    question: "Who can see the images attached to a message?",
    answer:
      "Only the sender and the receiver of that message. Attachments are served through your own account, so a link to an image is not publicly listable.",
  },
  {
    question: "What does two-step verification protect against?",
    answer:
      "It protects against a stolen password. When enabled, signing in requires a password and a six-digit code emailed to you. You can turn it on from Settings at any time.",
  },
  {
    question: "Can I delete messages?",
    answer:
      "Yes. As the receiver you can permanently delete a message and its attachments from your inbox. Deletion cannot be undone.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading id="faq" eyebrow="FAQ" title="Questions people actually ask." />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="divide-y divide-border border-t border-border">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-xl text-[14.5px] font-medium transition-colors hover:text-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                    >
                      <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-crimson px-6 py-14 text-bone flat-shadow sm:px-12">
            <div className="relative max-w-2xl">
              <p className="label-caps opacity-80">Start now</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-[-0.03em] sm:text-[2.75rem]">
                Your inbox is waiting to be read.
              </h2>
              <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed opacity-90">
                Create a link, share it once, and find out what people have been
                meaning to say. You keep control of every name.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" variant="secondary" asChild className="border-bone bg-bone text-bg hover:bg-bone">
                  <Link href="/register">
                    Create Your Link
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="border-[1.5px] border-bone/45 text-bone hover:bg-bone/10 hover:text-bone"
                >
                  <Link href="/send">Send a Message</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { SectionHeading };
