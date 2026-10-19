"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, LinkIcon } from "lucide-react";

import { extractRecipientId } from "@/lib/recipient";
import { PublicSend } from "@/components/messages/public-send";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Shown when `/send` is opened without a usable `?to=` — e.g. straight from the
 * landing page. Rather than a dead-end "link isn't valid", it asks for the one
 * thing it needs: the link someone shared.
 */
export function RecipientPrompt({ invalidLink = false }: { invalidLink?: boolean }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [recipientId, setRecipientId] = React.useState<string | null>(null);

  if (recipientId) return <PublicSend receiverId={recipientId} />;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const id = extractRecipientId(value);
    if (!id) {
      setError(
        "That doesn’t look like a RevealLink link. Paste the whole link someone shared with you.",
      );
      return;
    }

    setError(null);
    setRecipientId(id);

    // Keep the recipient in the address bar so a refresh or a re-share sticks.
    window.history.replaceState(null, "", `/send?to=${id}`);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-foreground">
          Who are you writing to?
        </h2>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          Paste the link they shared with you — it looks like{" "}
          <span className="rounded-md border border-border bg-bone/[0.07] px-1.5 py-0.5 font-sans text-[11.5px] text-foreground/80">
            reveallink.app/send?to=…
          </span>
          . Their id on its own works too.
        </p>
      </div>

      {invalidLink ? (
        <p
          role="alert"
          className="rounded-xl border-[1.5px] border-crimson/40 bg-crimson/12 px-3.5 py-2.5 text-[12.5px] leading-snug text-crimson"
        >
          The link you followed didn’t include a recipient — paste the full one below.
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="recipient-link">Their link</Label>

        <div className="flex gap-2">
          <div className="relative flex min-w-0 flex-1 items-center">
            <LinkIcon
              className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="recipient-link"
              name="recipient-link"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError(null);
              }}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "recipient-link-error" : "recipient-link-hint"}
              placeholder="https://reveallink.app/send?to=66f1…"
              className="pl-9 font-sans text-[12.5px]"
            />
          </div>

          <Button type="submit" className="shrink-0">
            <ArrowRightIcon aria-hidden="true" />
            Continue
          </Button>
        </div>

        {error ? (
          <p
            id="recipient-link-error"
            role="alert"
            className="text-[12.5px] leading-snug text-crimson"
          >
            {error}
          </p>
        ) : (
          <p
            id="recipient-link-hint"
            className="text-[12.5px] leading-snug text-muted-foreground"
          >
            We only use it to deliver your message — nothing about you is attached.
          </p>
        )}
      </div>

      <p className="border-t border-border pt-4 text-[12.5px] text-muted-foreground">
        Don’t have a link yet?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-crimson"
        >
          Get your own
        </Link>
      </p>
    </form>
  );
}
