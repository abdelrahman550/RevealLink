"use client";

import * as React from "react";
import Link from "next/link";
import { MailCheckIcon } from "lucide-react";

import { ComposeForm } from "@/components/messages/compose-form";
import { Button } from "@/components/ui/button";

/**
 * The public compose surface. After a successful send it swaps to a calm
 * confirmation rather than a toast — the sender usually has no account here.
 */
export function PublicSend({ receiverId }: { receiverId: string }) {
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div className="flat-card animate-appear flex flex-col items-center gap-5 rounded-2xl px-6 py-14 text-center shadow-lg">
        <span className="flex size-12 items-center justify-center rounded-full border-[1.5px] border-crimson/40 bg-crimson/12 text-crimson">
          <MailCheckIcon className="size-5" aria-hidden="true" />
        </span>

        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-bold tracking-[-0.03em]">
            It’s on its way
          </h2>
          <p className="mx-auto max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
            Your message arrived with no name attached. If they ever ask who sent it, the
            decision will be yours alone.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Button variant="outline" onClick={() => setSent(false)}>
            Write another
          </Button>
          <Button asChild>
            <Link href="/register">Get your own link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ComposeForm defaultReceiverId={receiverId} lockReceiver onSent={() => setSent(true)} />;
}
