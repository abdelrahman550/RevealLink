"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImagePlusIcon, SendIcon, XIcon } from "lucide-react";

import {
  ACCEPTED_IMAGE_ATTR,
  LIMITS,
} from "@/lib/constants";
import { cn, formatBytes } from "@/lib/utils";
import { composeMessageSchema, type ComposeMessageValues } from "@/lib/validation";
import { extractRecipientId } from "@/lib/recipient";
import { useHydrated } from "@/lib/use-hydrated";
import type { AnonymousMessage } from "@/lib/api/types";
import { createMessageAction } from "@/actions/message.actions";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/spinner";

/**
 * The compose surface, shared by the signed-in dashboard and the public
 * `/send?to=` page. The backend accepts anonymous senders, so the only
 * difference between the two is whether the recipient is editable.
 */
export function ComposeForm({
  defaultReceiverId = "",
  lockReceiver = false,
  onSent,
  submitLabel = "Send anonymously",
  className,
}: {
  defaultReceiverId?: string;
  lockReceiver?: boolean;
  onSent?: (message: AnonymousMessage) => void;
  submitLabel?: string;
  className?: string;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();

  /** Object URLs are derived from `files` and revoked when the set changes. */
  const previews = React.useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  React.useEffect(() => {
    return () => {
      for (const preview of previews) URL.revokeObjectURL(preview.url);
    };
  }, [previews]);

  const form = useForm<ComposeMessageValues>({
    resolver: zodResolver(composeMessageSchema),
    defaultValues: { receiverId: defaultReceiverId, content: "" },
  });

  const { errors } = form.formState;
  const receiverField = form.register("receiverId");

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;

    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (next.length >= LIMITS.maxAttachments) {
        setFileError(`You can attach up to ${LIMITS.maxAttachments} images.`);
        break;
      }
      if (!LIMITS.allowedImageTypes.includes(file.type as never)) {
        setFileError(`"${file.name}" isn’t a JPEG, PNG or GIF.`);
        continue;
      }
      if (file.size > LIMITS.maxAttachmentBytes) {
        setFileError(
          `"${file.name}" is ${formatBytes(file.size)} — the limit is ${formatBytes(LIMITS.maxAttachmentBytes)}.`,
        );
        continue;
      }
      next.push(file);
    }

    setFiles(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
    setFileError(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (files.length > LIMITS.maxAttachments) {
      setFileError(`You can attach up to ${LIMITS.maxAttachments} images.`);
      return;
    }

    setPending(true);
    setFileError(null);

    const payload = new FormData();
    payload.append("receiverId", values.receiverId);
    payload.append("content", values.content ?? "");
    for (const file of files) payload.append("attachments", file);

    const result = await createMessageAction(payload);
    setPending(false);

    if (!result.ok) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        if (field === "receiverId" || field === "content") {
          form.setError(field, { type: "server", message });
        } else {
          setFileError(message);
        }
      }
      toast.error(result.message);
      return;
    }

    toast.success("Sent — unsigned.");
    form.reset({ receiverId: lockReceiver ? defaultReceiverId : "", content: "" });
    setFiles([]);
    onSent?.(result.message);
  });

  return (
    <form
      onSubmit={onSubmit}
      // `method="post"` is a safety net: if someone submits before React
      // hydrates, the browser POSTs the body instead of GETting it — so a
      // half-written confession never lands in the URL bar or history.
      method="post"
      noValidate
      className={cn("flex flex-col gap-5", className)}
    >
      {lockReceiver ? (
        <input type="hidden" {...receiverField} />
      ) : (
        <FormItem
          label="Recipient"
          error={errors.receiverId?.message}
          hint="Paste the link they shared with you — or just their id."
          required
        >
          <Input
            {...receiverField}
            name="receiverId"
            spellCheck={false}
            autoComplete="off"
            placeholder="https://reveallink.app/send?to=66f1…"
            className="font-sans text-[12.5px]"
            onBlur={(event) => {
              // Accept a whole share link as well as a bare id: normalise it to
              // the id the API expects before validation runs.
              const id = extractRecipientId(event.target.value);
              if (id) {
                form.setValue("receiverId", id, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
              void receiverField.onBlur(event);
            }}
          />
        </FormItem>
      )}

      <FormItem
        label="Message"
        error={errors.content?.message}
        required
      >
        <Textarea
          {...form.register("content")}
          name="content"
          rows={6}
          placeholder="Say it. They’ll never know… unless you want them to."
          className="min-h-32 resize-y"
        />
      </FormItem>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="label-caps text-muted-foreground">Attachments</p>
          <p className="font-sans text-[11px] tracking-[0.06em] text-muted-foreground tnum">
            {files.length}/{LIMITS.maxAttachments} · up to {formatBytes(LIMITS.maxAttachmentBytes)} each
          </p>
        </div>

        {files.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {previews.map(({ file, url }, index) => (
              <li key={`${file.name}-${index}`}>
                <div className="relative size-20 overflow-hidden rounded-xl border border-border bg-bone/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    aria-label={`Remove ${file.name}`}
                  >
                    <XIcon className="size-3" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div>
          <input
            ref={inputRef}
            type="file"
            id="compose-attachments"
            accept={ACCEPTED_IMAGE_ATTR}
            multiple
            aria-label="Add image attachments"
            className="sr-only"
            onChange={(event) => addFiles(event.target.files)}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={files.length >= LIMITS.maxAttachments}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlusIcon aria-hidden="true" />
            Add images
          </Button>
        </div>

        {fileError ? (
          <p role="alert" className="text-[12.5px] text-crimson">
            {fileError}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-[12px] leading-snug text-muted-foreground">
          Your name is never attached. They can only ask.
        </p>

        <SubmitButton
          pending={pending}
          pendingLabel="Sending…"
          type={hydrated ? "submit" : "button"}
        >
          <SendIcon aria-hidden="true" />
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
