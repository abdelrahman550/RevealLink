"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeftIcon, CheckIcon, Loader2Icon, LockOpenIcon, SendIcon } from "lucide-react";

import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import type { ConversationMessage, UserSummary } from "@/lib/api/types";
import { sendConversationMessageAction } from "@/actions/conversation.actions";
import { conversationsApi, useGetConversationMessagesQuery } from "@/store/api/conversations.api";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { WinkFace } from "@/components/brand/wink-face";
import { QueryError } from "@/components/shared/query-error";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// The backend rejects any `limit` above 50 on paginated routes.
const MESSAGE_LIMIT = 50;

const byCreatedAt = (a: ConversationMessage, b: ConversationMessage) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

/** Three solid bone dots, bouncing. */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" role="status" aria-label="Sending">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="animate-bounce-dot size-1.5 rounded-full bg-bone"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </span>
  );
}

/**
 * A private, revealed conversation.
 *
 * New messages are appended optimistically with a temporary id, then swapped
 * for the server's copy — so the reply feels instant without lying about
 * persistence.
 */
export function ConversationThread({
  conversationId,
  meId,
  other,
}: {
  conversationId: string;
  meId: string;
  other: UserSummary;
}) {
  const dispatch = useAppDispatch();
  const queryArg = { conversationId, page: 1, limit: MESSAGE_LIMIT };

  const { data, isLoading, isUninitialized, isError, error, refetch } =
    useGetConversationMessagesQuery(queryArg);

  const [optimistic, setOptimistic] = React.useState<ConversationMessage[]>([]);
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [justSent, setJustSent] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // The send button becomes a checkmark for a beat, then relaxes.
  React.useEffect(() => {
    if (!justSent) return;
    const timer = window.setTimeout(() => setJustSent(false), 1400);
    return () => window.clearTimeout(timer);
  }, [justSent]);

  const messages = React.useMemo(() => {
    const merged = [...(data?.messages ?? []), ...optimistic];
    const seen = new Set<string>();
    return merged
      .filter((message) => {
        if (seen.has(message._id)) return false;
        seen.add(message._id);
        return true;
      })
      .sort(byCreatedAt);
  }, [data, optimistic]);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const content = body.trim();
    if (content.length < 2 || sending) return;

    const temp: ConversationMessage = {
      _id: `optimistic-${Date.now()}`,
      conversationId,
      senderId: meId,
      content,
      createdAt: new Date().toISOString(),
    };

    setOptimistic((current) => [...current, temp]);
    setBody("");
    setSending(true);

    const result = await sendConversationMessageAction({ conversationId, content });

    setSending(false);
    setOptimistic((current) => current.filter((message) => message._id !== temp._id));

    if (!result.ok) {
      toast.error(result.message);
      setBody(content);
      return;
    }

    dispatch(
      conversationsApi.util.updateQueryData("getConversationMessages", queryArg, (draft) => {
        draft.messages.push(result.data);
      }),
    );
    setJustSent(true);
    dispatch(api.util.invalidateTags(["Conversations"]));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const loading = isLoading || isUninitialized;

  return (
    <div className="flat-card flex h-[calc(100dvh-9.5rem)] min-h-[30rem] flex-col overflow-hidden rounded-2xl lg:h-[calc(100dvh-6rem)]">
      <header className="flex items-center gap-3 border-b-[1.5px] border-border px-4 py-3">
        <Button asChild variant="ghost" size="icon" className="-ml-1 shrink-0">
          <Link href="/dashboard/conversations" aria-label="Back to conversations">
            <ArrowLeftIcon aria-hidden="true" />
          </Link>
        </Button>

        <UserAvatar name={other.userName} image={other.image} className="size-9" />

        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-foreground">{other.userName}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-crimson bg-crimson px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone">
            <LockOpenIcon className="size-3" aria-hidden="true" />
            Revealed
          </span>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {/* Identity is unlocked here, so the wink has both eyes open. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <WinkFace
            open
            className="size-[min(70vw,26rem)] -rotate-[12deg] text-crimson opacity-[0.05]"
          />
        </div>

        <div
          ref={scrollRef}
          className="relative flex h-full flex-col gap-3 overflow-y-auto px-4 py-5 scroll-area-thin"
          aria-live="polite"
        >
          {loading ? (
            <>
              <Skeleton className="h-12 w-2/3 max-w-xs rounded-2xl" />
              <Skeleton className="ml-auto h-12 w-1/2 max-w-xs rounded-2xl" />
              <Skeleton className="h-16 w-3/5 max-w-sm rounded-2xl" />
            </>
          ) : isError ? (
            <QueryError error={error} onRetry={() => void refetch()} />
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-[13.5px] font-semibold text-foreground">Say hello</p>
              <p className="max-w-xs text-[12.5px] text-muted-foreground">
                You both chose to be known to each other. This is the first place either of
                you can be honest.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                mine={message.senderId === meId}
              />
            ))
          )}
        </div>
      </div>

      <form
        className="border-t-[1.5px] border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Say it. They already know it's you."
            aria-label="Message"
            className={cn(
              "max-h-40 min-h-11 flex-1 resize-none rounded-2xl border-[1.5px] border-input bg-bone/[0.05] px-4 py-3 text-sm transition-[border-color,background-color] duration-150",
              "placeholder:text-muted-foreground hover:border-bone/30",
              "focus-visible:border-crimson focus-visible:outline-none",
            )}
          />

          <Button
            type="submit"
            size="icon"
            disabled={sending || body.trim().length < 2}
            aria-label="Send message"
          >
            {sending ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            ) : justSent ? (
              <CheckIcon aria-hidden="true" />
            ) : (
              <SendIcon aria-hidden="true" />
            )}
          </Button>
        </div>

        <p className="mt-2 px-0.5 label-caps text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: ConversationMessage;
  mine: boolean;
}) {
  const optimistic = message._id.startsWith("optimistic-");

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(34rem,80%)] rounded-2xl px-4 py-2.5",
          mine
            ? "rounded-br-md bg-crimson text-bone"
            : "rounded-bl-md border-[1.5px] border-border bg-background text-foreground",
          optimistic && "opacity-70",
        )}
      >
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{message.content}</p>

        <span
          className={cn(
            "mt-1 flex justify-end text-[9.5px] font-semibold uppercase tracking-[0.14em] tnum",
            mine ? "text-bone/70" : "text-muted-foreground",
          )}
        >
          {optimistic ? (
            <TypingDots />
          ) : (
            <time dateTime={message.createdAt} title={formatDateTime(message.createdAt)}>
              {formatRelativeTime(message.createdAt)}
            </time>
          )}
        </span>
      </div>
    </div>
  );
}
