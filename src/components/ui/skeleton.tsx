import * as React from "react";

import { cn } from "@/lib/utils";

/** A flat bone placeholder with a hard bar sweeping across it. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-xl bg-bone/[0.06]",
        "after:animate-shimmer after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:bg-bone/[0.12] after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
