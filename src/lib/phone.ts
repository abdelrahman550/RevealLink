/**
 * Egyptian phone helpers.
 *
 * The backend stores numbers in E.164 (`+201012345678`) and rejects anything
 * else. In the UI we ask only for the national part and render a fixed `+20`
 * prefix, so these helpers move between the two representations.
 */

export const EGYPT_DIAL_CODE = "+20";

/** Number of digits in an Egyptian national mobile number (after `+20`). */
export const EGYPT_NATIONAL_LENGTH = 10;

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

/**
 * Normalises any way a user may type or paste an Egyptian number into the
 * 10-digit national form:
 *   `+20 101 234 5678` -> `1012345678`
 *   `00201012345678`   -> `1012345678`
 *   `01012345678`      -> `1012345678`
 *   `1012345678`       -> `1012345678`
 */
export function toNationalEgyptPhone(value: string): string {
  let digits = digitsOnly(value);

  if (digits.startsWith("0020")) digits = digits.slice(4);
  else if (digits.startsWith("20") && digits.length > EGYPT_NATIONAL_LENGTH) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) digits = digits.slice(1);

  return digits.slice(0, EGYPT_NATIONAL_LENGTH);
}

/**
 * Runs on every keystroke so the visible value and the stored value always
 * agree. Plain digits are kept as typed (a leading `0` is allowed while
 * typing); a pasted international number is reduced to its national part.
 */
export function sanitizeEgyptPhoneInput(value: string): string {
  const trimmed = value.trim();
  const digits = digitsOnly(trimmed);

  if (trimmed.startsWith("+") || trimmed.startsWith("00") || digits.length > EGYPT_NATIONAL_LENGTH + 1) {
    return toNationalEgyptPhone(trimmed);
  }

  return digits.slice(0, EGYPT_NATIONAL_LENGTH + 1);
}

/** Any accepted form -> the E.164 string the backend expects. */
export function toE164EgyptPhone(value: string): string {
  return `${EGYPT_DIAL_CODE}${toNationalEgyptPhone(value)}`;
}

/** E.164 (or anything else) -> national form, for prefilling a form field. */
export function fromE164EgyptPhone(value: string | null | undefined): string {
  return value ? toNationalEgyptPhone(value) : "";
}
