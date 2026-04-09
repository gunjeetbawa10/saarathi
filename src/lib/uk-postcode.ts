/**
 * Normalise a UK postcode to `OUTWARD INWARD` (e.g. LL59 5LP).
 * Returns null if the string cannot be a valid UK postcode shape.
 */
export function normalizeUkPostcode(raw: string): string | null {
  const compact = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (compact.length < 5 || compact.length > 7) return null;
  const inward = compact.slice(-3);
  if (!/^\d[A-Z]{2}$/.test(inward)) return null;
  const outward = compact.slice(0, -3);
  if (outward.length < 2 || outward.length > 4) return null;
  return `${outward} ${inward}`;
}
