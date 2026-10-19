import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-display text-[12.5px] font-semibold",
    "transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-150",
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Solid crimson on a hard offset; the press lands it on the shadow. */
        default:
          "border-[1.5px] border-crimson bg-crimson text-bone shadow-[3px_3px_0_var(--crimson)] hover:shadow-[5px_5px_0_var(--crimson)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        /** A quieter emphasis, same flat crimson shape with a hairline. */
        accent:
          "border-[1.5px] border-crimson bg-transparent text-crimson hover:bg-crimson hover:text-bone active:translate-x-[2px] active:translate-y-[2px]",
        /** Reserved for reveal moments: bone-outlined, fills crimson on hover. */
        reveal:
          "border-[1.5px] border-bone/45 bg-transparent text-bone hover:border-crimson hover:bg-crimson active:translate-x-[2px] active:translate-y-[2px]",
        destructive:
          "border-[1.5px] border-crimson bg-crimson text-bone shadow-[3px_3px_0_var(--bone)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        /** Secondary: transparent with a bone outline. */
        outline:
          "border-[1.5px] border-bone/45 bg-transparent text-bone hover:border-bone hover:bg-bone/6 active:translate-x-[2px] active:translate-y-[2px]",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-bone/6 hover:text-foreground",
        link: "text-crimson underline-offset-4 hover:underline",
        secondary:
          "border-[1.5px] border-bone/45 bg-transparent text-bone hover:border-bone hover:bg-bone/6",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-[11.5px]",
        lg: "h-12 px-7 text-[14px]",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
