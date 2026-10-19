"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRightIcon,
  EyeIcon,
  EyeOffIcon,
  MessageSquareHeartIcon,
  Trash2Icon,
} from "lucide-react";

import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { revealStatusEnum, type AnonymousMessage } from "@/lib/api/types";
import { createRevealRequestAction } from "@/actions/reveal.actions";
import { deleteMessageAction } from "@/actions/message.actions";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { AttachmentGrid } from "@/components/shared/attachments";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RevealStatusBadge } from "@/components/shared/reveal-status";
import { MaskedAvatar, UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";

/**
 * One anonymous message, in the receiver's or the sender's framing.
 *
 * The reveal request is the only mutating affordance here, and it is applied
 * optimistically: the badge flips to "Requested" before the round-trip
 * finishes and reverts if the server disagrees.
 */
export function MessageCard({
  message,
  context,
}: {
  message: AnonymousMessage;
  context: "received" | "sent" | "both";
}) {
  const dispatch = useAppDispatch();
  const [requested, setRequested] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const status = requested ? revealStatusEnum.PENDING : message.revealStatus;
  const isAnonymous = status !== revealStatusEnum.APPROVED;
  const showRevealAction = context !== "sent" && status === revealStatusEnum.NONE;
  const showSender = status === revealStatusEnum.APPROVED && message.sender;

  const askToReveal = async () => {
    setRequested(true);
    const result = await createRevealRequestAction({ messageId: message._id });

    if (!result.ok) {
      setRequested(false);
      toast.error(result.message);
      return;
    }

    toast.success("Request sent. The ball's in their court.");
    dispatch(
      api.util.invalidateTags([
        { id: "received", type: "Messages" },
        "Messages",
        { id: message._id, type: "Message" },
        "SentRevealRequests",
      ]),
    );
  };

  const remove = async () => {
    setDeleting(true);
    const result = await deleteMessageAction({ messageId: message._id });
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("Message deleted");
    dispatch(api.util.invalidateTags(["Messages", { id: message._id, type: "Message" }]));
  };

  const hasBody = Boolean(message.content?.trim());

  return (
    <article
      className={cn(
        "group flex flex-col gap-3 rounded-2xl p-4 transition-colors sm:p-5",
        // A hidden identity keeps the crimson tint; a revealed sender drops it.
        isAnonymous ? "flat-tint" : "flat-card",
        deleting && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex items-center gap-3">
        {isAnonymous ? <MaskedAvatar className="size-9" /> : null}

        <RevealStatusBadge status={status} />

        <time
          dateTime={message.createdAt}
          title={formatDateTime(message.createdAt)}
          className="ml-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum"
        >
          {formatRelativeTime(message.createdAt)}
        </time>
      </div>

      {hasBody ? (
        <Link
          href={`/dashboard/messages/${message._id}`}
          className="rounded-xl focus-visible:outline-none"
        >
          <p className="line-clamp-4 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
            {message.content}
          </p>
        </Link>
      ) : (
        <p className="text-[13.5px] italic text-muted-foreground">
          This message is just attachments.
        </p>
      )}

      {message.attachments.length > 0 ? (
        <AttachmentGrid attachments={message.attachments} size="sm" />
      ) : null}

      {showSender && message.sender ? (
        <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-crimson/40 bg-crimson/12 px-3 py-2">
          <UserAvatar
            name={message.sender.userName}
            image={message.sender.image}
            className="size-7"
          />
          <p className="text-[12.5px] text-foreground">
            <span className="text-muted-foreground">Revealed as </span>
            <span className="font-semibold">{message.sender.userName}</span>
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {showRevealAction ? (
          <Button
            type="button"
            variant="reveal"
            size="sm"
            className="group/reveal"
            onClick={() => void askToReveal()}
          >
            {/* The eye opens when you reach for it. */}
            <span className="relative grid size-4 place-items-center">
              <EyeOffIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 transition-opacity duration-150 group-hover/reveal:opacity-0 group-active/reveal:opacity-0"
              />
              <EyeIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 opacity-0 transition-opacity duration-150 group-hover/reveal:opacity-100 group-active/reveal:opacity-100"
              />
            </span>
            Request Reveal
          </Button>
        ) : null}

        {context !== "sent" && status === revealStatusEnum.PENDING && !requested ? (
          <p className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <MessageSquareHeartIcon className="size-3.5" aria-hidden="true" />
            Awaiting their decision
          </p>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/messages/${message._id}`}>
              Open
              <ArrowUpRightIcon aria-hidden="true" />
            </Link>
          </Button>

          {context !== "sent" ? (
            <ConfirmDialog
              title="Delete this message?"
              description="This removes it from your inbox for good. It can’t be undone."
              confirmLabel="Delete message"
              destructive
              onConfirm={remove}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete message"
                  className="text-muted-foreground hover:text-crimson"
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              }
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
