const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function looksLikeEmail(contact: string): boolean {
  return EMAIL_RE.test(contact.trim());
}
