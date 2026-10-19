"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  InboxIcon,
  MessagesSquareIcon,
  SendIcon,
  UserCheckIcon,
} from "lucide-react";

import { cn, formatRelativeTime } from "@/lib/utils";
import { messagesFilterEnum } from "@/lib/api/types";
import { useGetMessagesQuery } from "@/store/api/messages.api";
import { useGetReceivedRevealRequestsQuery } from "@/store/api/reveal.api";
import { useGetConversationsQuery } from "@/store/api/conversations.api";
import { useGetMeQuery } from "@/store/api/users.api";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShareLink } from "@/components/share/share-link";
import { RevealStatusBadge } from "@/components/shared/reveal-status";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverviewPage() {
  const me = useGetMeQuery();

  const received = useGetMessagesQuery({
    type: messagesFilterEnum.RECEIVED,
    page: 1,
    limit: 4,
  });
  const sent = useGetMessagesQuery({
    type: messagesFilterEnum.SENT,
    page: 1,
    limit: 1,
  });
  const pending = useGetReceivedRevealRequestsQuery({ status: "pending", page: 1, limit: 1 });
  const conversations = useGetConversationsQuery({ page: 1, limit: 1 });

  const loading = received.isLoading || received.isUninitialized;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={greeting()}
        title={me.data?.userName ? `Hello, ${firstName(me.data.userName)}` : "Welcome back"}
        description="A quiet summary of who’s been writing, and what’s waiting on you."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="In your inbox"
          value={received.data?.pagination.total}
          icon={InboxIcon}
          href="/dashboard/messages"
          loading={loading}
        />
        <StatTile
          label="Awaiting a reveal"
          value={pending.data?.pagination.total}
          icon={UserCheckIcon}
          href="/dashboard/requests"
          loading={pending.isLoading || pending.isUninitialized}
        />
        <StatTile
          label="Conversations"
          value={conversations.data?.pagination.total}
          icon={MessagesSquareIcon}
          href="/dashboard/conversations"
          loading={conversations.isLoading || conversations.isUninitialized}
        />
        <StatTile
          label="You sent"
          value={sent.data?.pagination.total}
          icon={SendIcon}
          href="/dashboard/new"
          loading={sent.isLoading || sent.isUninitialized}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="recent-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
            <h2 id="recent-heading" className="font-display text-xl font-bold tracking-[-0.03em]">
              Latest in your inbox
            </h2>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flat-card rounded-2xl p-4">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : !received.data || received.data.messages.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title="Quiet for now."
              description="Secrets take their time. Share your link and the first anonymous message will land right here."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {received.data.messages.map((message) => (
                <li key={message._id}>
                  <Link
                    href={`/dashboard/messages/${message._id}`}
                    className="flat-card group block rounded-2xl p-4 transition-[border-color,box-shadow] hover:border-crimson/40 hover:flat-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <RevealStatusBadge status={message.revealStatus} />
                      <time
                        dateTime={message.createdAt}
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum"
                      >
                        {formatRelativeTime(message.createdAt)}
                      </time>
                    </div>

                    <p className="mt-3 line-clamp-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
                      {message.content?.trim() || "Attachments only"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="share-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
            <h2 id="share-heading" className="font-display text-xl font-bold tracking-[-0.03em]">
              Invite a message
            </h2>
          </div>

          {me.data ? (
            <ShareLink userId={me.data._id} />
          ) : (
            <Skeleton className="h-40 w-full rounded-2xl" />
          )}

          <div className="flat-card rounded-2xl p-5 shadow-sm">
            <p className="label-caps text-muted-foreground">Quick actions</p>

            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/dashboard/new">
                  <SendIcon aria-hidden="true" />
                  Send a message
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/dashboard/requests">
                  <UserCheckIcon aria-hidden="true" />
                  Review reveal requests
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value?: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flat-card group flex flex-col gap-2 rounded-2xl p-4 transition-[border-color,box-shadow]",
        "hover:border-crimson/40 hover:flat-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      )}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span className="label-caps">{label}</span>
      </span>

      {loading ? (
        <Skeleton className="mt-1 h-8 w-10" />
      ) : (
        <span className="text-crimson font-display text-3xl font-bold leading-none tracking-[-0.03em] tnum">
          {value ?? 0}
        </span>
      )}
    </Link>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(userName: string) {
  return userName.trim().split(/\s+/)[0] ?? userName;
}
