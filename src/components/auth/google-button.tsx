"use client";

import * as React from "react";
import { toast } from "sonner";

import { googleSignInAction } from "@/actions/auth.actions";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { GOOGLE_CLIENT_ID, GOOGLE_SIGN_IN_ENABLED } from "@/lib/constants";

/**
 * Google Identity Services issues an ID token in the browser; we hand it to the
 * backend's `/auth/signup-with-gmail` endpoint via a server action, which either
 * creates the account or returns credentials for an existing one.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const dispatch = useAppDispatch();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pending, setPending] = React.useState(false);

  const handleCredential = React.useCallback(
    async (credential: string) => {
      setPending(true);
      const result = await googleSignInAction(credential);
      setPending(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      dispatch(api.util.resetApiState());
      // A full navigation guarantees the fresh session cookie is picked up everywhere.
      window.location.assign(new URL("/dashboard", window.location.origin).href);
    },
    [dispatch],
  );

  /** Mounts the Google-rendered button into our container. No React state. */
  const renderButton = React.useCallback(() => {
    const google = window.google;
    const container = containerRef.current;
    if (!google || !container) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) void handleCredential(response.credential);
      },
    });

    container.replaceChildren();
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: 320,
    });
  }, [handleCredential]);

  React.useEffect(() => {
    if (!GOOGLE_SIGN_IN_ENABLED) return;

    // The library may already be present (e.g. a client-side navigation back).
    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", renderButton, { once: true });
      return () => existing.removeEventListener("load", renderButton);
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => toast.error("Google sign-in could not be loaded.");
    document.head.appendChild(script);
  }, [renderButton]);

  // Without a configured client ID the endpoint cannot be reached — hide it.
  if (!GOOGLE_SIGN_IN_ENABLED) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="label-caps text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <div className="flex justify-center">
        <div ref={containerRef} aria-label={label} />
      </div>

      {pending ? (
        <p role="status" aria-live="polite" className="text-center text-[12.5px] text-muted-foreground">
          Signing you in…
        </p>
      ) : null}

      {/* Fallback when the GIS button fails to render. */}
      <noscript>
        <Button variant="outline" className="w-full" disabled>
          {label}
        </Button>
      </noscript>
    </div>
  );
}
