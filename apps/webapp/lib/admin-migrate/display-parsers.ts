/** Parse a display money string (`$1,150.00`, `1150`, `—`) to integer cents. */
export function parseDisplayCents(value: string | null | undefined): number | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;
  const numeric = trimmed.replace(/[^0-9.-]/g, "");
  if (!numeric || numeric === "-" || numeric === ".") return null;
  const dollars = Number(numeric);
  if (!Number.isFinite(dollars)) return null;
  return Math.round(dollars * 100);
}

/** Parse the leading integer from strings like `3 years` or `50 seats`. */
export function parseLeadingInt(value: string | null | undefined): number | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return null;
  const match = trimmed.match(/-?\d+/);
  if (!match) return null;
  return Number(match[0]);
}
