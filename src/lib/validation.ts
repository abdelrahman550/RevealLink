import { z } from "zod";
import { GenderEnum } from "@/lib/api/types";
import { LIMITS } from "@/lib/constants";

/**
 * Client-side mirrors of the backend's Zod rules
 * (src/common/validation.js plus each module's own validation file).
 * Keeping them in sync means the first error a user sees is instant and
 * local, while the server remains the source of truth.
 */

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,64}$/;
const OTP_REGEX = /^\d{6}$/;
const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;
/** Letters (any script), marks, spaces, apostrophes, periods and hyphens. */
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;

export const passwordMessage =
  "8–64 characters with an uppercase letter, a lowercase letter, a number & one of # ? ! @ $ % ^ & * -";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .max(254, "That email address is too long.")
  .pipe(z.email("Please enter a valid email address."));

export const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .regex(PASSWORD_REGEX, passwordMessage);

/** Just checks the field was filled in (used for confirm-password fields). */
export const passwordPresenceSchema = z
  .string()
  .min(1, "Password is required.");

export const otpSchema = z
  .string()
  .min(1, "Verification code is required.")
  .regex(OTP_REGEX, "Verification code must be exactly 6 digits.");

export const mongoIdSchema = z
  .string()
  .trim()
  .min(1, "ID is required.")
  .regex(MONGO_ID_REGEX, "Invalid ID format.");

/** Raw text pasted into the "who are you writing to?" prompt. */
export const recipientInputSchema = z
  .string()
  .trim()
  .min(1, "Paste the link someone shared with you.")
  .max(2048, "That link is too long — paste just the link.");

function nameSchema(label: "First name" | "Last name") {
  return z
    .string()
    .trim()
    .min(2, `${label} must be between 2 and 25 characters.`)
    .max(25, `${label} must be between 2 and 25 characters.`)
    .regex(NAME_REGEX, "Use letters, spaces, apostrophes, periods or hyphens only.");
}

export const firstNameSchema = nameSchema("First name");

export const lastNameSchema = nameSchema("Last name");

export const userNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your first and last name.")
  .max(51, "Name must be under 51 characters.")
  .regex(NAME_REGEX, "Use letters, spaces, apostrophes, periods or hyphens only.")
  .refine((value) => value.includes(" "), {
    message: "Enter both your first and last name.",
  });

/** Full E.164 number — what the backend stores and validates. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .pipe(
    z.e164("Enter a valid phone number in international format, e.g. +201012345678."),
  );

/**
 * The national part only (no `+20`). The UI renders a fixed country-code
 * prefix, so the field itself never contains it.
 */
export const egyptPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .regex(
    /^0?1\d{9}$/,
    "Enter a 10-digit Egyptian mobile number, e.g. 1012345678.",
  );

const earliestBirthDate = new Date(Date.UTC(LIMITS.earliestBirthYear, 0, 1));

export const dobSchema = z
  .iso
  .date("Date of birth must be a valid date (YYYY-MM-DD).")
  .refine((value) => new Date(`${value}T00:00:00Z`) <= new Date(), {
    message: "Date of birth cannot be in the future.",
  })
  .refine((value) => new Date(`${value}T00:00:00Z`) >= earliestBirthDate, {
    message: `Date of birth cannot be before ${LIMITS.earliestBirthYear}.`,
  })
  .refine(
    (value) => {
      const birth = new Date(`${value}T00:00:00Z`);
      const now = new Date();
      const cutoff = new Date(
        Date.UTC(now.getUTCFullYear() - LIMITS.minimumAge, now.getUTCMonth(), now.getUTCDate()),
      );
      return birth <= cutoff;
    },
    { message: `You must be at least ${LIMITS.minimumAge} years old.` },
  );

export const genderSchema = z.union([
  z.literal(GenderEnum.MALE),
  z.literal(GenderEnum.FEMALE),
]);

export const messageContentSchema = z
  .string()
  .trim()
  .min(LIMITS.messageMin, `Message must be at least ${LIMITS.messageMin} characters long.`)
  .max(LIMITS.messageMax, `Message must not exceed ${LIMITS.messageMax} characters.`);

/* ------------------------------------------------------------------ *
 * Forms
 * ------------------------------------------------------------------ */

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .strictObject({
    userName: userNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordPresenceSchema,
    phone: phoneSchema,
    DOB: dobSchema,
    gender: genderSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

/**
 * Client side counterpart of {@link registerSchema}. Identical rules except the
 * phone is entered without the `+20` prefix; the form composes the E.164 value
 * before the server action is called.
 */
export const registerFormSchema = z
  .strictObject({
    userName: userNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordPresenceSchema,
    phone: egyptPhoneSchema,
    DOB: dobSchema,
    gender: genderSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export type RegisterValues = z.infer<typeof registerFormSchema>;

export const otpFormSchema = z.strictObject({
  email: emailSchema,
  otp: otpSchema,
});
export type OtpFormValues = z.infer<typeof otpFormSchema>;

export const forgotPasswordSchema = z.strictObject({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .strictObject({
    email: emailSchema,
    otp: otpSchema,
    password: passwordSchema,
    confirmPassword: passwordPresenceSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const profileBase = {
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  DOB: dobSchema.optional().or(z.literal("")),
  gender: genderSchema,
} as const;

/** Server payload — the phone arrives as E.164. */
export const profileSchema = z
  .strictObject({ ...profileBase, phone: phoneSchema })
  .refine(
    (data) =>
      [data.firstName, data.lastName, data.phone, data.DOB, data.gender].some(
        (v) => v !== undefined && v !== "",
      ),
    { message: "At least one field must be provided to update." },
  );

/** Client form — the phone is entered without the `+20` prefix. */
export const profileFormSchema = z
  .strictObject({ ...profileBase, phone: egyptPhoneSchema })
  .refine(
    (data) =>
      [data.firstName, data.lastName, data.phone, data.DOB, data.gender].some(
        (v) => v !== undefined && v !== "",
      ),
    { message: "At least one field must be provided to update." },
  );
export type ProfileValues = z.infer<typeof profileFormSchema>;

export const composeMessageSchema = z.strictObject({
  receiverId: mongoIdSchema,
  content: messageContentSchema,
});
export type ComposeMessageValues = z.infer<typeof composeMessageSchema>;

export const conversationMessageSchema = z.strictObject({
  content: messageContentSchema,
});
export type ConversationMessageValues = z.infer<typeof conversationMessageSchema>;
