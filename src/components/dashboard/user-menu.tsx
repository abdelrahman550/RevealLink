"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOutIcon, MenuIcon, SettingsIcon, UserIcon } from "lucide-react";

import { logoutAction } from "@/actions/auth.actions";
import { api } from "@/store/api/base-api";
import { useGetMeQuery } from "@/store/api/users.api";
import { useAppDispatch } from "@/store/hooks";
import { AppNav } from "@/components/dashboard/app-nav";
import { Logo } from "@/components/brand/logo";
import { ShareLink } from "@/components/share/share-link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [pending, setPending] = React.useState(false);

  // Prefer the live profile so a freshly-saved name or photo shows immediately.
  const { data: me } = useGetMeQuery();
  const name = me?.userName ?? user.name;
  const email = me?.email ?? user.email;
  const image = me?.image ?? user.image;

  const signOut = React.useCallback(
    async (action: 0 | 1) => {
      setPending(true);
      await logoutAction(action);
      dispatch(api.util.resetApiState());
      toast.success(action === 1 ? "Signed out on all devices" : "Signed out");
      router.replace("/login");
      router.refresh();
    },
    [dispatch, router],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full ring-1 ring-bone/15 transition-shadow hover:flat-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        aria-label="Account menu"
      >
        <UserAvatar name={name} image={image} className="size-8" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="block truncate text-[13px] font-medium text-foreground">
            {name ?? "Your account"}
          </span>
          <span className="mt-0.5 block truncate text-[12px] font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <UserIcon aria-hidden="true" />
            Profile &amp; Security
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings#appearance">
            <SettingsIcon aria-hidden="true" />
            Appearance
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={pending} onSelect={() => void signOut(0)}>
          <LogOutIcon aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>

        <DropdownMenuItem disabled={pending} onSelect={() => void signOut(1)}>
          <LogOutIcon aria-hidden="true" />
          Sign Out Everywhere
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileAppNav({ user }: { user: SessionUser }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[min(17rem,85vw)] p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo href="/dashboard" />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4 scroll-area-thin">
          <AppNav onNavigate={() => setOpen(false)} />
        </div>

        <div className="border-t border-border p-3">
          <ShareLink userId={user.id} compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
