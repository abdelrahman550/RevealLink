import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-xl border-[1.5px] border-input bg-bone/[0.05] px-4 py-3 text-sm transition-[border-color,background-color] duration-150",
        "placeholder:text-muted-foreground",
        "hover:border-bone/30",
        "focus-visible:border-crimson focus-visible:bg-bone/[0.07] focus-visible:outline-none",
        "aria-invalid:border-crimson",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
