"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Pagination as PaginationMeta } from "@/lib/api/types";

/**
 * Server-driven pager. The page lives in the URL so the view is shareable and
 * the back button behaves.
 */
export function Pagination({
  meta,
  onPageChange,
  className,
  itemLabel = "items",
}: {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
  itemLabel?: string;
}) {
  if (!meta || !meta.pages || meta.pages <= 1) return null;

  const { currentPage, pages, total, limit } = meta;
  const first = (currentPage - 1) * limit + 1;
  const last = Math.min(currentPage * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum">
        {first}–{last} of {total} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon aria-hidden="true" />
          Previous
        </Button>

        <span className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tnum">
          Page {currentPage} of {pages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pages}
        >
          Next
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
