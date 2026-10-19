"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  InboxIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  SendIcon,
  SettingsIcon,
  UserCheckIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/messages", label: "Inbox", icon: InboxIcon },
  { href: "/dashboard/requests", label: "Reveal Requests", icon: UserCheckIcon },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessagesSquareIcon },
  { href: "/dashboard/new", label: "Send a Message", icon: SendIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
] as const;

function isActive(pathname: string, item: (typeof NAV_ITEMS)[number]) {
  if ("exact" in item && item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  return (
    <nav aria-label="Dashboard" className={cn("relative flex flex-col gap-0.5", className)}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors duration-150",
              "focus-visible:outline-none",
              active
                ? "bg-crimson/12 font-semibold text-foreground"
                : "text-muted-foreground hover:bg-bone/[0.06] hover:text-foreground",
            )}
          >
            <item.icon
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 transition-colors duration-150",
                active && "text-crimson",
              )}
            />

            <span className="truncate">{item.label}</span>

            {active ? (
              prefersReduced ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0.5 h-[3px] rounded-full bg-crimson"
                />
              ) : (
                // One shared element, so the rule snaps between tabs.
                <motion.span
                  aria-hidden="true"
                  layoutId="app-nav-indicator"
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                  className="absolute inset-x-3 bottom-0.5 h-[3px] rounded-full bg-crimson"
                />
              )
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
