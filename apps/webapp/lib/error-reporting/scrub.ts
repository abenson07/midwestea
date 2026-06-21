const MAX_TEXT_LENGTH = 2000;

export function scrubText(text: string): string {
  return text
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[email redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[jwt redacted]")
    .replace(/supabase[_-]?key[=:\s]+[^\s&]+/gi, "supabase_key=[redacted]");
}

export function truncateText(text: string, maxLength = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export function scrubAndTruncate(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return truncateText(scrubText(text));
}
