"use client";

import * as React from "react";
import { ImageIcon, Maximize2Icon } from "lucide-react";

import { cn, proxiedAssetUrl } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closePreview, openPreview } from "@/store/slices/ui.slice";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Attachments arrive as backend paths (`assets/messages/<uuid>.png`). They are
 * rendered through the same-origin proxy so nothing hits the API host directly.
 */
export function AttachmentGrid({
  attachments,
  className,
  size = "md",
}: {
  attachments: string[];
  className?: string;
  size?: "sm" | "md";
}) {
  const dispatch = useAppDispatch();
  const visible = attachments.slice(0, 3);
  const overflow = attachments.length - visible.length;

  if (attachments.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-2",
        className,
      )}
    >
      {visible.map((attachment, index) => {
        const src = proxiedAssetUrl(attachment);
        const isLast = index === visible.length - 1;

        return (
          <li key={attachment}>
            <button
              type="button"
              onClick={() => src && dispatch(openPreview(src))}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-bone/[0.06]",
                "transition-opacity hover:opacity-90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                size === "sm" ? "size-16" : "size-24",
              )}
              aria-label={`Open attachment ${index + 1} of ${attachments.length}`}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- proxied, unoptimized by design
                <img
                  src={src}
                  alt=""
                  width={size === "sm" ? 64 : 96}
                  height={size === "sm" ? 64 : 96}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="m-auto size-4 text-muted-foreground" aria-hidden="true" />
              )}

              <span className="absolute inset-0 flex items-center justify-center bg-background/45 opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2Icon className="size-4 text-foreground" aria-hidden="true" />
              </span>

              {isLast && overflow > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-semibold text-foreground tnum">
                  +{overflow}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Single global lightbox driven by the `ui` slice. */
export function AttachmentLightbox() {
  const src = useAppSelector((state) => state.ui.previewSrc);
  const dispatch = useAppDispatch();

  return (
    <Dialog
      open={Boolean(src)}
      onOpenChange={(open) => {
        if (!open) dispatch(closePreview());
      }}
    >
      <DialogContent
        showCloseButton
        className="max-w-3xl border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">Attachment preview</DialogTitle>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- proxied, unoptimized by design
          <img
            src={src}
            alt="Attachment preview"
            className="mx-auto max-h-[80dvh] w-auto rounded-2xl border border-border object-contain"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
