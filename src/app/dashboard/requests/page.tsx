"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserCheckIcon } from "lucide-react";

import type { ReceivedRevealRequest, RevealRequestStatus } from "@/lib/api/types";
import { decideRevealRequestAction } from "@/actions/reveal.actions";
import {
  revealApi,
  useGetReceivedRevealRequestsQuery,
  useGetSentRevealRequestsQuery,
} from "@/store/api/reveal.api";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { pageParam, useUrlState } from "@/lib/use-url-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReceivedRequestCard, SentRequestCard } from "@/components/reveal/request-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { QueryError } from "@/components/shared/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnlockOverlay } from "@/components/reveal/unlock-overlay";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Declined" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const STATUS_VALUES = STATUS_FILTERS.map((filter) => filter.value) as readonly string[];

export default function RequestsPage() {
  const { searchParams, setParams } = useUrlState();

  const tab = searchParams.get("tab") === "sent" ? "sent" : "received";
  const page = pageParam(searchParams);
  const statusParam = searchParams.get("status");
  const status: StatusFilter | "all" =
    statusParam && STATUS_VALUES.includes(statusParam)
      ? (statusParam as StatusFilter)
      : "all";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reveal requests"
        title="Identity requests"
        description="Someone would like you to know who they are. A name is only ever shared with your consent."
      />

      <Tabs
        value={tab}
        onValueChange={(next) => setParams({ tab: next, page: null, status: null })}
      >
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <ReceivedList
            status={status}
            page={page}
            onStatusChange={(next) =>
              setParams({ status: next === "all" ? null : next, page: null })
            }
            onPageChange={(next) => setParams({ page: next })}
          />
        </TabsContent>

        <TabsContent value="sent">
          <SentList page={page} onPageChange={(next) => setParams({ page: next })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReceivedList({
  status,
  page,
  onStatusChange,
  onPageChange,
}: {
  status: StatusFilter | "all";
  page: number;
  onStatusChange: (status: StatusFilter) => void;
  onPageChange: (page: number) => void;
}) {
  const dispatch = useAppDispatch();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [unlocking, setUnlocking] = React.useState(false);

  const arg = { status, page, limit: PAGE_SIZE } as const;
  const { data, isLoading, isUninitialized, isFetching, isError, error, refetch } =
    useGetReceivedRevealRequestsQuery(arg);

  const loading = isLoading || isUninitialized;

  const decide = async (
    request: ReceivedRevealRequest,
    decision: "approved" | "rejected",
  ) => {
    setPendingId(request._id);

    // Optimistic: flip the badge before the request completes.
    const patch = dispatch(
      revealApi.util.updateQueryData("getReceivedRevealRequests", arg, (draft) => {
        const item = draft.requests.find((entry) => entry._id === request._id);
        if (item) item.status = decision;
      }),
    );

    const result = await decideRevealRequestAction({
      requestId: request._id,
      decision,
    });

    setPendingId(null);

    if (!result.ok) {
      patch.undo();
      toast.error(result.message);
      return;
    }

    toast.success(
      decision === "approved"
        ? "Revealed — a conversation is now open."
        : "You stayed anonymous.",
    );

    if (decision === "approved") setUnlocking(true);

    dispatch(
      api.util.invalidateTags([
        "ReceivedRevealRequests",
        "SentRevealRequests",
        "Conversations",
        "Messages",
      ]),
    );
  };

  return (
    <div className="space-y-5">
      <UnlockOverlay show={unlocking} onDone={() => setUnlocking(false)} />
      <Tabs value={status} onValueChange={(next) => onStatusChange(next as StatusFilter)}>
        <TabsList>
          {STATUS_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <RequestListSkeleton />
      ) : isError ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : !data || data.requests.length === 0 ? (
        <EmptyState
          icon={UserCheckIcon}
          title="Nothing waiting."
          description="When someone wants you to know who they are, their request will appear here for you to accept or decline."
        />
      ) : (
        <div className="space-y-5">
          <ul
            className="flex flex-col gap-3 transition-opacity data-[fetching=true]:opacity-60"
            data-fetching={isFetching}
          >
            {data.requests.map((request) => (
              <li key={request._id}>
                <ReceivedRequestCard
                  request={request}
                  pending={pendingId === request._id}
                  onDecide={(decision) => void decide(request, decision)}
                />
              </li>
            ))}
          </ul>

          <Pagination meta={data.pagination} onPageChange={onPageChange} itemLabel="requests" />
        </div>
      )}
    </div>
  );
}

function SentList({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { data, isLoading, isUninitialized, isFetching, isError, error, refetch } =
    useGetSentRevealRequestsQuery({ page, limit: PAGE_SIZE });

  const loading = isLoading || isUninitialized;

  if (loading) return <RequestListSkeleton />;
  if (isError) return <QueryError error={error} onRetry={() => void refetch()} />;

  if (!data || data.requests.length === 0) {
    return (
      <EmptyState
        icon={UserCheckIcon}
        title="You haven’t asked anyone yet."
        description="Open a message in your inbox and choose “Ask who sent this” to find out who’s been writing to you."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/messages">Go to inbox</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <ul
        className="flex flex-col gap-3 transition-opacity data-[fetching=true]:opacity-60"
        data-fetching={isFetching}
      >
        {data.requests.map((request) => (
          <li key={request._id}>
            <SentRequestCard request={request} />
          </li>
        ))}
      </ul>

      <Pagination meta={data.pagination} onPageChange={onPageChange} itemLabel="requests" />
    </div>
  );
}

function RequestListSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading requests">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flat-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
