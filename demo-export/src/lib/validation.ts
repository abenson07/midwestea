/**
 * Shared form validation helpers
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 7;
const PHONE_DIGITS_REGEX = /\d/g;

export function validateEmail(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null;
  const trimmed = value.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePhone(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null;
  const digits = (value.match(PHONE_DIGITS_REGEX) ?? []).length;
  if (digits < PHONE_MIN_DIGITS) {
    return "Please enter a valid phone number (at least 7 digits).";
  }
  return null;
}
