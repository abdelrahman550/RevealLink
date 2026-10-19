"use client";

import Link from "next/link";
import { InboxIcon, SendIcon } from "lucide-react";

import { useGetMessagesQuery } from "@/store/api/messages.api";
import { messagesFilterEnum, type MessagesFilter } from "@/lib/api/types";
import { pageParam, useUrlState } from "@/lib/use-url-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { MessageCard } from "@/components/messages/message-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { QueryError } from "@/components/shared/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FILTERS = [
  { value: messagesFilterEnum.RECEIVED, label: "Received" },
  { value: messagesFilterEnum.SENT, label: "Sent" },
  { value: messagesFilterEnum.BOTH, label: "Everything" },
] as const satisfies readonly { value: MessagesFilter; label: string }[];

const PAGE_SIZE = 10;

export default function MessagesPage() {
  const { searchParams, setParams } = useUrlState();

  const typeParam = searchParams.get("type");
  const type: MessagesFilter = FILTERS.some((filter) => filter.value === typeParam)
    ? (typeParam as MessagesFilter)
    : messagesFilterEnum.RECEIVED;
  const page = pageParam(searchParams);

  const { data, isLoading, isUninitialized, isFetching, isError, error, refetch } =
    useGetMessagesQuery({ type, page, limit: PAGE_SIZE });

  const loading = isLoading || isUninitialized;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Everything that arrived unsigned — and everything you sent that way."
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/new">
              <SendIcon aria-hidden="true" />
              New message
            </Link>
          </Button>
        }
      />

      <Tabs value={type} onValueChange={(next) => setParams({ type: next, page: null })}>
        <TabsList>
          {FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <MessageListSkeleton />
      ) : isError ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : !data || data.messages.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={emptyTitle(type)}
          description={emptyDescription(type)}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={type === messagesFilterEnum.SENT ? "/dashboard/new" : "/dashboard/settings"}>
                {type === messagesFilterEnum.SENT ? "Send a message" : "Share your link"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ul
            aria-busy={isFetching || undefined}
            className="flex flex-col gap-3 transition-opacity data-[fetching=true]:opacity-60"
            data-fetching={isFetching}
          >
            {data.messages.map((message) => (
              <li key={message._id}>
                <MessageCard message={message} context={type === messagesFilterEnum.SENT ? "sent" : "received"} />
              </li>
            ))}
          </ul>

          <Pagination
            meta={data.pagination}
            onPageChange={(next) => setParams({ page: next })}
            itemLabel="messages"
          />
        </div>
      )}
    </div>
  );
}

function emptyTitle(type: MessagesFilter) {
  if (type === messagesFilterEnum.SENT) return "Nothing sent yet.";
  if (type === messagesFilterEnum.BOTH) return "Nothing here yet.";
  return "Quiet for now.";
}

function emptyDescription(type: MessagesFilter) {
  if (type === messagesFilterEnum.SENT) {
    return "Messages you send anonymously will appear here, along with whether the recipient asked to know who you are.";
  }
  if (type === messagesFilterEnum.BOTH) {
    return "No messages have been sent or received on this account yet.";
  }
  return "Secrets take their time. Share your link and the first message will land here — unsigned.";
}

function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading messages">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flat-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <Skeleton className="mt-4 h-4 w-full max-w-lg" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="ml-auto h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
