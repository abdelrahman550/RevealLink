import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ *
 * Formatting — always through Intl, never hardcoded patterns.
 * ------------------------------------------------------------------ */

export function formatDate(
  value: string | number | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function formatDateTime(value: string | number | Date | undefined | null): string {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

export function formatRelativeTime(value: string | number | Date | undefined | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(elapsedSeconds) >= seconds || unit === "second") {
      return formatter.format(Math.round(elapsedSeconds / seconds), unit);
    }
  }
  return "just now";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: value >= 10 || exponent === 0 ? 0 : 1 }).format(value)} ${units[exponent]}`;
}

/* ------------------------------------------------------------------ *
 * Small display helpers
 * ------------------------------------------------------------------ */

/** "Jane Doe" → "JD". Handles empty/short input gracefully. */
export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/**
 * A relative path like `assets/messages/x.png` → a same-origin proxied URL
 * (`/api/assets/messages/x.png`).
 *
 * The backend stores uploads as `assets/<folder>/<file>` and serves them from
 * `GET /assets/<folder>/<file>`. Our own proxy already re-adds the leading
 * `assets/` segment, so it has to be stripped here — otherwise the path
 * doubles up (`/api/assets/assets/...`) and every image 404s.
 */
export function proxiedAssetUrl(assetPath?: string | null): string | null {
  if (!assetPath) return null;
  if (/^(https?:)?\/\//i.test(assetPath) || assetPath.startsWith("data:")) return assetPath;

  const path = assetPath
    .replace(/^\/+/, "")
    .replace(/^assets\//i, "");

  return path ? `/api/assets/${path}` : null;
}

/** Accepts `assets/messages/x.png` or a full URL and returns a display string. */
export function fileNameFromPath(path?: string | null): string {
  if (!path) return "attachment";
  const last = path.split(/[\\/]/).pop() ?? path;
  return last;
}

export function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
