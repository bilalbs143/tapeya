/**
 * Converts a string to kebab-case (lowercase, spaces and punctuation to hyphens).
 * Used for real-time slug generation from name.
 */
export function toKebabCase(value: string | null | undefined): string {
  if (value == null) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}
