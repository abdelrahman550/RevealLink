import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "border-crimson bg-crimson text-bone",
        accent: "border-crimson bg-crimson/12 text-crimson",
        secondary: "border-bone/25 bg-transparent text-bone/70",
        outline: "border-bone/25 bg-transparent text-bone",
        destructive: "border-crimson bg-crimson/12 text-crimson",
        muted: "border-bone/20 bg-transparent text-muted-foreground",
        /** Hidden identity — the crimson "ANONYMOUS" state. */
        anon: "border-crimson bg-crimson/12 text-bone",
        success: "border-bone/40 bg-bone/12 text-bone",
        warning: "border-bone/40 bg-bone/12 text-bone",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
