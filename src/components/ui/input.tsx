import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-full border-[1.5px] border-input bg-bone/[0.05] px-4 py-1 text-sm transition-[border-color,background-color] duration-150",
        "placeholder:text-muted-foreground selection:bg-crimson selection:text-bone",
        "hover:border-bone/30",
        "focus-visible:border-crimson focus-visible:bg-bone/[0.07] focus-visible:outline-none",
        "aria-invalid:border-crimson",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
