import type { Metadata } from "next";

import { requireSession } from "@/lib/session";
import { AppNav } from "@/components/dashboard/app-nav";
import { MobileAppNav, UserMenu } from "@/components/dashboard/user-menu";
import { Logo } from "@/components/brand/logo";
import { ShareLink } from "@/components/share/share-link";
import { AttachmentLightbox } from "@/components/shared/attachments";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r-[1.5px] border-border bg-bone/[0.03] lg:flex">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Logo href="/dashboard" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 scroll-area-thin">
          <AppNav />
        </div>

        <div className="border-t border-border p-3">
          <ShareLink userId={user.id} compact />

          <div className="mt-3 flex items-center justify-end gap-2 pl-1">
            <div className="min-w-0 text-right">
              <p className="max-w-[8rem] truncate text-[12.5px] font-medium leading-tight text-foreground">
                {user.name ?? "Your account"}
              </p>
              <p className="max-w-[8rem] truncate text-[10px] leading-tight tracking-[0.08em] text-muted-foreground">
                {user.email}
              </p>
            </div>

            <UserMenu user={user} />
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        {/* Mobile bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b-[1.5px] border-border bg-background px-3 lg:hidden">
          <MobileAppNav user={user} />
          <Logo href="/dashboard" />

          <div className="ml-auto flex items-center gap-1">
            <UserMenu user={user} />
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      <AttachmentLightbox />
    </div>
  );
}
