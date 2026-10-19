"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadIcon } from "lucide-react";

import { ACCEPTED_IMAGE_ATTR, LIMITS } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import type { User } from "@/lib/api/types";
import { uploadProfileImageAction } from "@/actions/user.actions";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";

export function AvatarUpload({ user }: { user: User }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const preview = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const choose = (selected: FileList | null) => {
    setError(null);
    const next = selected?.[0];
    if (!next) return;

    if (!LIMITS.allowedImageTypes.includes(next.type as never)) {
      setError("Use a JPEG, PNG or GIF image.");
      return;
    }
    if (next.size > LIMITS.maxProfileImageBytes) {
      setError(`Keep the image under ${formatBytes(LIMITS.maxProfileImageBytes)}.`);
      return;
    }

    setFile(next);
  };

  const upload = async () => {
    if (!file) return;

    setPending(true);
    const formData = new FormData();
    formData.append("attachment", file);

    const result = await uploadProfileImageAction(formData);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      toast.error(result.message);
      return;
    }

    toast.success("Profile photo updated");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    dispatch(api.util.invalidateTags(["User"]));
    router.refresh();
  };

  const src = preview ?? (file ? null : user.image);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <UserAvatar name={user.userName} image={src} className="size-16 text-base" />

      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          id="profile-image"
          accept={ACCEPTED_IMAGE_ATTR}
          aria-label="Profile image"
          className="sr-only"
          onChange={(event) => choose(event.target.files)}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon aria-hidden="true" />
            {file ? "Choose another" : "Choose image"}
          </Button>

          {file ? (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              aria-busy={pending || undefined}
              onClick={() => void upload()}
            >
              {pending ? "Uploading…" : "Upload"}
            </Button>
          ) : null}

          {file ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setFile(null);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>

        <p className="mt-2 text-[12px] text-muted-foreground">
          Square images look best. JPEG, PNG or GIF, up to {formatBytes(LIMITS.maxProfileImageBytes)}.
        </p>

        {error ? (
          <p role="alert" className="mt-1 text-[12.5px] text-crimson">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
