export const APP_NAME = "RevealLink";
export const APP_TAGLINE = "Say it freely. Reveal on your terms.";
export const APP_DESCRIPTION =
  "RevealLink lets people message you anonymously — and ask to reveal who they are. You decide when a name is worth knowing.";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const GOOGLE_SIGN_IN_ENABLED = GOOGLE_CLIENT_ID.length > 0;

/* --------------------------- limits ------------------------------ */
/** Mirrors src/common/validation.js and the multer middleware. */
export const LIMITS = {
  maxAttachments: 3,
  maxAttachmentBytes: 5 * 1024 * 1024,
  maxProfileImageBytes: 3 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif"],
  passwordMin: 8,
  passwordMax: 64,
  messageMin: 2,
  messageMax: 50_000,
} as const;

export const PASSWORD_REQUIREMENTS =
  "8–64 characters with an uppercase letter, a lowercase letter, a number & one of # ? ! @ $ % ^ & * -";

export const ACCEPTED_IMAGE_ATTR =
  "image/jpeg,image/png,image/gif";
