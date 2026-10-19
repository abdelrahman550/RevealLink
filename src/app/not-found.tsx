import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo href="/" />

      <span className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-crimson/40 bg-crimson/12 text-crimson">
        <CompassIcon className="size-5" aria-hidden="true" />
      </span>

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          This link doesn’t lead anywhere.
        </h1>
        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-muted-foreground">
          The page may have been deleted, or the address was mistyped. Nothing is
          broken on your side.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
