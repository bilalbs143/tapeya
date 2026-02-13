/**
 * Normalize API enum value (e.g. "BOWLER", "ACTIVE") to lowercase for form controls
 * that expect value like "bowler", "active".
 */
export function normalizeEnumValue(value: string | undefined | null, fallback: string): string {
  if (value == null || value === '') return fallback;
  return value.toLowerCase();
}
