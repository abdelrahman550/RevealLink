"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-1.5 text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
