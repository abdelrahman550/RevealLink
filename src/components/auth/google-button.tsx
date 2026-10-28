"use client";

import * as React from "react";
import { toast } from "sonner";

import { googleSignInAction } from "@/actions/auth.actions";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { GOOGLE_CLIENT_ID, GOOGLE_SIGN_IN_ENABLED } from "@/lib/constants";

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
const GSI_LOAD_TIMEOUT_MS = 8_000;

let gsiInitialized = false;
let gsiCredentialListener: ((credential: string) => void) | null = null;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const dispatch = useAppDispatch();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const handleCredential = React.useCallback(
    async (credential: string) => {
      setPending(true);

      try {
        const result = await googleSignInAction(credential);

        if (!result.ok) {
          toast.error(
            result.message ||
              "We couldn't start your session. Please try signing in again.",
          );
          return;
        }

        dispatch(api.util.resetApiState());
        window.location.assign(
          new URL("/dashboard", window.location.origin).href,
        );
      } catch {
        toast.error(
          "We couldn't start your session. Please try signing in again.",
        );
      } finally {
        setPending(false);
      }
    },
    [dispatch],
  );

  React.useEffect(() => {
    if (!GOOGLE_SIGN_IN_ENABLED) return;

    const listener = (credential: string) => {
      void handleCredential(credential);
    };

    gsiCredentialListener = listener;

    return () => {
      if (gsiCredentialListener === listener) gsiCredentialListener = null;
    };
  }, [handleCredential]);

  const renderButton = React.useCallback(() => {
    const google = window.google?.accounts;
    const container = containerRef.current;
    if (!google?.id || !container) return;

    if (!gsiInitialized) {
      google.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            gsiCredentialListener?.(response.credential);
          }
        },
      });
      gsiInitialized = true;
    }

    const width = Math.min(
      Math.max(Math.round(container.getBoundingClientRect().width), 200),
      400,
    );

    try {
      container.replaceChildren();
      google.id.renderButton(container, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        locale: "en",
        width,
      });
      setFailed(false);
      setReady(true);
    } catch {
      setFailed(true);
    }
  }, []);

  React.useEffect(() => {
    if (!GOOGLE_SIGN_IN_ENABLED) return;

    const fail = () => {
      setFailed(true);
      toast.error("Google sign-in could not be loaded.");
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    let timeout: number | undefined;

    const start = () => {
      window.clearTimeout(timeout);

      if (window.google?.accounts?.id) {
        renderButton();
      } else {
        fail();
      }
    };

    const failNow = () => {
      window.clearTimeout(timeout);
      fail();
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );

    if (existing) {
      existing.addEventListener("load", start, { once: true });
      existing.addEventListener("error", failNow, { once: true });
      timeout = window.setTimeout(() => {
        if (!window.google?.accounts?.id) fail();
      }, GSI_LOAD_TIMEOUT_MS);

      return () => {
        window.clearTimeout(timeout);
        existing.removeEventListener("load", start);
        existing.removeEventListener("error", failNow);
      };
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", start, { once: true });
    script.addEventListener("error", failNow, { once: true });
    document.head.appendChild(script);

    timeout = window.setTimeout(() => {
      if (!window.google?.accounts?.id) fail();
    }, GSI_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", start);
      script.removeEventListener("error", failNow);
    };
  }, [renderButton]);

  React.useEffect(() => {
    if (!GOOGLE_SIGN_IN_ENABLED || failed) return;

    let frame = 0;

    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(renderButton);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [renderButton, failed]);

  if (!GOOGLE_SIGN_IN_ENABLED) return null;

  const triggerGoogle = () => {
    const google = window.google?.accounts;

    if (!google?.id) {
      toast.error(
        "Google sign-in is unavailable right now. Use email and password instead.",
      );
      return;
    }

    try {
      google.id.prompt();
    } catch {
      toast.error(
        "We couldn't start your session. Please try signing in again.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative min-h-10">
        {failed ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-center gap-2.5 rounded-full"
            onClick={triggerGoogle}
            disabled={pending}
          >
            <GoogleIcon className="size-[18px]" />
            <span className="text-sm font-medium">
              {pending ? "Signing you in…" : label}
            </span>
          </Button>
        ) : (
          <div className="relative h-10 w-full overflow-hidden rounded-full">
            <div
              ref={containerRef}
              className="flex h-10 w-full items-center justify-center"
              aria-label={label}
            />

            {!ready ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-pulse bg-bone/[0.06]"
              />
            ) : null}
          </div>
        )}
      </div>

      {pending ? (
        <p
          role="status"
          aria-live="polite"
          className="animate-pulse text-center text-xs text-muted-foreground"
        >
          Signing you in…
        </p>
      ) : null}

      <div className="relative flex items-center" aria-hidden="true">
        <div className="h-px flex-1 bg-border/60" />
        <span className="label-caps mx-4 flex-shrink-0 text-muted-foreground">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <noscript>
        <Button
          variant="outline"
          className="h-10 w-full justify-center gap-2.5 rounded-full"
          disabled
        >
          <GoogleIcon className="size-[18px]" />
          {label}
        </Button>
      </noscript>
    </div>
  );
}
