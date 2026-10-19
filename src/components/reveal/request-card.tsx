"use client";

import * as React from "react";
import { CheckIcon, ImageIcon, XIcon } from "lucide-react";

import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  revealRequestStatusEnum,
  type ReceivedRevealRequest,
  type SentRevealRequest,
} from "@/lib/api/types";
import { AttachmentGrid } from "@/components/shared/attachments";
import { RevealRequestStatusBadge } from "@/components/shared/reveal-status";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";

/**
 * Someone who received one of your anonymous messages wants to know who you
 * are. You are always in control of the answer — nothing is revealed unless
 * you say so.
 */
export function ReceivedRequestCard({
  request,
  onDecide,
  pending,
}: {
  request: ReceivedRevealRequest;
  onDecide: (decision: "approved" | "rejected") => void;
  pending: boolean;
}) {
  const awaiting = request.status === revealRequestStatusEnum.PENDING;

  return (
    <article
      className={cn(
        "animate-appear flex flex-col gap-4 rounded-2xl p-4 sm:p-5",
        awaiting ? "flat-tint" : "flat-card",
      )}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={request.requester.userName}
          image={request.requester.image}
          className="size-9"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-snug text-foreground">
            <span className="font-semibold">{request.requester.userName}</span>
            <span className="text-muted-foreground"> wants to know who you are.</span>
          </p>
          <time
            dateTime={request.createdAt}
            title={formatDateTime(request.createdAt)}
            className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum"
          >
            {formatRelativeTime(request.createdAt)}
          </time>
        </div>

        <RevealRequestStatusBadge status={request.status} />
      </div>

      {request.message ? (
        <div className="rounded-xl border-[1.5px] border-border bg-bone/[0.04] p-3.5">
          <p className="label-caps text-muted-foreground">The message in question</p>

          {request.message.content?.trim() ? (
            <p className="mt-2.5 line-clamp-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
              {request.message.content}
            </p>
          ) : (
            <p className="mt-2.5 text-[13px] italic text-muted-foreground">
              Attachments only
            </p>
          )}

          {request.message.attachments.length > 0 ? (
            <AttachmentGrid attachments={request.message.attachments} size="sm" className="mt-3" />
          ) : null}
        </div>
      ) : (
        <p className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <ImageIcon className="size-3.5" aria-hidden="true" />
          The original message is no longer available.
        </p>
      )}

      {awaiting ? (
        <div className="flex flex-wrap items-center gap-2 border-t-[1.5px] border-border pt-4">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => onDecide("approved")}
          >
            <CheckIcon aria-hidden="true" />
            Reveal Myself
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onDecide("rejected")}
          >
            <XIcon aria-hidden="true" />
            Stay Hidden
          </Button>

          <p className="text-[12px] text-muted-foreground">
            Revealing opens a private conversation between you.
          </p>
        </div>
      ) : null}
    </article>
  );
}

/** A request you sent, waiting on (or answered by) the other person. */
export function SentRequestCard({ request }: { request: SentRevealRequest }) {
  const revealed = request.status === revealRequestStatusEnum.APPROVED;
  const declined = request.status === revealRequestStatusEnum.REJECTED;

  return (
    <article className="flat-card flex flex-col gap-3 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <RevealRequestStatusBadge status={request.status} />

        <time
          dateTime={request.createdAt}
          title={formatDateTime(request.createdAt)}
          className="ml-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum"
        >
          {formatRelativeTime(request.createdAt)}
        </time>
      </div>

      {revealed && request.sender ? (
        <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-crimson/40 bg-crimson/12 px-3 py-2">
          <UserAvatar
            name={request.sender.userName}
            image={request.sender.image}
            className="size-7"
          />
          <p className="text-[12.5px] text-foreground">
            <span className="text-muted-foreground">It was </span>
            <span className="font-semibold">{request.sender.userName}</span>
          </p>
        </div>
      ) : (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {declined
            ? "They're keeping the mystery. Respect it."
            : "Request sent. The ball's in their court."}
        </p>
      )}

      <p className="label-caps text-muted-foreground/60">
        message {request.messageId}
      </p>
    </article>
  );
}
