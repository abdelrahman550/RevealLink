"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import type { Conversation } from "@/lib/api/types";
import { useGetMeQuery } from "@/store/api/users.api";
import { useLazyGetConversationsQuery } from "@/store/api/conversations.api";
import { ConversationThread } from "@/components/conversations/conversation-thread";
import { EmptyState } from "@/components/shared/empty-state";
import { QueryError } from "@/components/shared/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The API exposes no single-conversation route, so a thread's participant
 * details have to come from the list — and `limit` is capped at 50 on paginated
 * routes, so an older conversation can sit past the first page. Walk the list
 * (widest allowed page size first) until the thread turns up.
 */
const PAGE_SIZE = 50;

type Lookup =
  | { status: "loading" }
  | { status: "found"; conversation: Conversation }
  | { status: "missing" }
  | { status: "error"; error: unknown };

export default function ConversationThreadPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;

  const me = useGetMeQuery();
  const [fetchConversations] = useLazyGetConversationsQuery();

  const [attempt, setAttempt] = React.useState(0);
  const [resolved, setResolved] = React.useState<{ key: string; result: Lookup } | null>(
    null,
  );

  const key = `${conversationId}#${attempt}`;
  const lookup: Lookup = resolved?.key === key ? resolved.result : { status: "loading" };

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        let page = 1;
        let pages = 1;
        let found: Conversation | undefined;

        do {
          const result = await fetchConversations({ page, limit: PAGE_SIZE }).unwrap();
          pages = result.pagination.pages || 1;
          found = result.conversations.find((item) => item._id === conversationId);
          page += 1;
        } while (!found && page <= pages);

        if (cancelled) return;
        setResolved({
          key,
          result: found ? { status: "found", conversation: found } : { status: "missing" },
        });
      } catch (error) {
        if (cancelled) return;
        setResolved({ key, result: { status: "error", error } });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, key, fetchConversations]);

  if (me.isLoading || me.isUninitialized || lookup.status === "loading") {
    return (
      <div className="flat-card flex h-[calc(100dvh-9.5rem)] min-h-[30rem] flex-col gap-3 rounded-2xl p-4 lg:h-[calc(100dvh-6rem)]">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-4 h-12 w-2/3 max-w-xs rounded-2xl" />
        <Skeleton className="ml-auto h-12 w-1/2 max-w-xs rounded-2xl" />
      </div>
    );
  }

  if (me.isError || lookup.status === "error") {
    return (
      <QueryError
        error={me.isError ? me.error : lookup.status === "error" ? lookup.error : undefined}
        onRetry={() => {
          void me.refetch();
          setAttempt((current) => current + 1);
        }}
      />
    );
  }

  const meId = me.data?._id;
  const conversation = lookup.status === "found" ? lookup.conversation : undefined;
  const sender = conversation?.sender;
  const receiver = conversation?.receiver;
  const other =
    meId && sender && receiver
      ? sender._id === meId
        ? receiver
        : sender
      : undefined;

  if (!conversation || !meId || !other) {
    return (
      <EmptyState
        title="Conversation not found"
        description="This thread may have been removed, or the link is out of date."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/conversations">
              <ArrowLeftIcon aria-hidden="true" />
              Back to conversations
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <ConversationThread conversationId={conversationId} meId={meId} other={other} />
  );
}
