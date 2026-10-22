/** Post-login `from` — internal paths only; rejects `//` and scheme URLs. */
export function safeInternalPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//')) return fallback;
  if (path.includes('\\')) return fallback;
  return path;
}
