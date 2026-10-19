"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * A solid crimson bar that drops in from the top with bone text — no glass,
 * no blur, no rich colour fills. The look lives in `globals.css`.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      offset={16}
      mobileOffset={16}
      gap={10}
      closeButton
      {...props}
    />
  );
}
