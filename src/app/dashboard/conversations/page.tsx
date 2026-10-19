"use client";

import Link from "next/link";
import { ArrowUpRightIcon, MessagesSquareIcon } from "lucide-react";

import { formatRelativeTime } from "@/lib/utils";
import type { Conversation, UserSummary } from "@/lib/api/types";
import { pageParam, useUrlState } from "@/lib/use-url-state";
import { useGetMeQuery } from "@/store/api/users.api";
import { useGetConversationsQuery } from "@/store/api/conversations.api";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { QueryError } from "@/components/shared/query-error";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

function otherParticipant(conversation: Conversation, meId?: string): UserSummary {
  if (meId && conversation.sender._id === meId) return conversation.receiver;
  return conversation.sender;
}

export default function ConversationsPage() {
  const { searchParams, setParams } = useUrlState();
  const page = pageParam(searchParams);

  const me = useGetMeQuery();
  const { data, isLoading, isUninitialized, isError, error, refetch } =
    useGetConversationsQuery({
      page,
      limit: PAGE_SIZE,
    });

  const meId = me.data?._id;
  const loading = isLoading || isUninitialized || me.isLoading || me.isUninitialized;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conversations"
        title="Open threads"
        description="Real conversations that began when someone chose to be known to you."
      />

      {loading ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading conversations">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flat-card flex items-center gap-3 rounded-2xl p-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : isError || me.isError ? (
        <QueryError
          error={error ?? me.error}
          onRetry={() => {
            void refetch();
            void me.refetch();
          }}
        />
      ) : !data || data.conversations.length === 0 ? (
        <EmptyState
          icon={MessagesSquareIcon}
          title="No threads yet."
          description="When you accept a reveal request — or someone accepts yours — a private thread opens here."
        />
      ) : (
        <div className="space-y-5">
          <ul className="flex flex-col gap-3">
            {data.conversations.map((conversation) => {
              const other = otherParticipant(conversation, meId);

              return (
                <li key={conversation._id}>
                  <Link
                    href={`/dashboard/conversations/${conversation._id}`}
                    className="flat-card group flex items-center gap-3.5 rounded-2xl p-4 transition-[border-color,box-shadow] hover:border-crimson/40 hover:flat-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <UserAvatar name={other.userName} image={other.image} className="size-10" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-foreground">
                        {other.userName}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Opened {formatRelativeTime(conversation.createdAt)}
                      </p>
                    </div>

                    <ArrowUpRightIcon
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <Pagination
            meta={data.pagination}
            onPageChange={(next) => setParams({ page: next })}
            itemLabel="conversations"
          />
        </div>
      )}
    </div>
  );
}
