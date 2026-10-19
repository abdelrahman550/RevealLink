"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-react";

import { formatDateTime } from "@/lib/utils";
import { revealStatusEnum } from "@/lib/api/types";
import { createRevealRequestAction } from "@/actions/reveal.actions";
import { deleteMessageAction } from "@/actions/message.actions";
import { useGetMessageQuery } from "@/store/api/messages.api";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { WinkFace } from "@/components/brand/wink-face";
import { AttachmentGrid } from "@/components/shared/attachments";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RevealStatusBadge } from "@/components/shared/reveal-status";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/shared/query-error";

export default function MessageDetailPage() {
  const params = useParams<{ messageId: string }>();
  const messageId = Array.isArray(params.messageId) ? params.messageId[0] : params.messageId;
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { data, isLoading, isUninitialized, isError, error, refetch } =
    useGetMessageQuery(messageId);
  const [requested, setRequested] = React.useState(false);

  const loading = isLoading || isUninitialized;

  const askToReveal = async () => {
    setRequested(true);
    const result = await createRevealRequestAction({ messageId });

    if (!result.ok) {
      setRequested(false);
      toast.error(result.message);
      return;
    }

    toast.success("Request sent. The ball’s in their court.");
    dispatch(
      api.util.invalidateTags([
        "Messages",
        { id: messageId, type: "Message" },
        "SentRevealRequests",
      ]),
    );
  };

  const remove = async () => {
    const result = await deleteMessageAction({ messageId });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Message deleted");
    dispatch(api.util.invalidateTags(["Messages", { id: messageId, type: "Message" }]));
    router.push("/dashboard/messages");
  };

  const status = requested ? revealStatusEnum.PENDING : data?.revealStatus;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/messages">
            <ArrowLeftIcon aria-hidden="true" />
            Back to messages
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flat-card space-y-4 rounded-2xl p-6 shadow-lg">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
          <Skeleton className="h-4 w-1/2 max-w-md" />
        </div>
      ) : isError || !data ? (
        <QueryError
          message={
            (error as { status?: number } | undefined)?.status === 404
              ? "We couldn’t load this message. It may have been deleted."
              : undefined
          }
          error={error}
          onRetry={() => void refetch()}
        />
      ) : (
        <article className="flat-card animate-appear overflow-hidden rounded-2xl shadow-lg">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <RevealStatusBadge status={status ?? revealStatusEnum.NONE} />

            <time
              dateTime={data.createdAt}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum"
            >
              {formatDateTime(data.createdAt)}
            </time>
          </header>

          <div className="space-y-5 px-5 py-6 sm:px-6">
            {data.content?.trim() ? (
              <p className="whitespace-pre-wrap text-[15px] leading-[1.75] text-foreground">
                {data.content}
              </p>
            ) : (
              <p className="text-[13.5px] italic text-muted-foreground">
                This message is just attachments.
              </p>
            )}

            {data.attachments.length > 0 ? (
              <AttachmentGrid attachments={data.attachments} />
            ) : null}

            {status === revealStatusEnum.APPROVED && data.sender ? (
              <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-crimson/40 bg-crimson/12 px-4 py-3">
                <UserAvatar
                  name={data.sender.userName}
                  image={data.sender.image}
                  className="size-9"
                />
                <div className="min-w-0">
                  <p className="label-caps text-crimson">Revealed as</p>
                  <p className="text-[14px] font-semibold text-foreground">
                    {data.sender.userName}
                  </p>
                </div>

                {/* Both eyes open: the identity is unlocked. */}
                <WinkFace
                  open
                  className="ml-auto size-9 shrink-0 text-crimson/50"
                />
              </div>
            ) : null}
          </div>

          <Separator />

          <footer className="flex flex-wrap items-center gap-2 px-5 py-4 sm:px-6">
            {status === revealStatusEnum.NONE ? (
              <Button
                type="button"
                variant="reveal"
                size="sm"
                className="group/reveal"
                onClick={() => void askToReveal()}
              >
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

            {status === revealStatusEnum.PENDING ? (
              <p className="text-[12.5px] text-muted-foreground">
                You’ve asked to know who sent this. Awaiting their decision.
              </p>
            ) : null}

            {status === revealStatusEnum.REJECTED ? (
              <p className="text-[12.5px] text-muted-foreground">
                They’re keeping the mystery. Respect it.
              </p>
            ) : null}

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
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-crimson"
                >
                  <Trash2Icon aria-hidden="true" />
                  Delete
                </Button>
              }
            />
          </footer>
        </article>
      )}
    </div>
  );
}
