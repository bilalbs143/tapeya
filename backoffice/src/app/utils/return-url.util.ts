const DEFAULT_RETURN = '/dashboard';
const MAX_LEN = 512;

/**
 * Normalizes post-login navigation target. Prevents open redirects, nested
 * `returnUrl` chains, and sending users back to auth pages.
 */
export function safeReturnUrl(raw: string | null | undefined): string {
  if (raw == null || raw === '') return DEFAULT_RETURN;

  let trimmed = raw.trim();
  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    return DEFAULT_RETURN;
  }

  if (trimmed.length > MAX_LEN) return DEFAULT_RETURN;
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return DEFAULT_RETURN;
  if (trimmed.includes('://')) return DEFAULT_RETURN;

  const withoutHash = trimmed.split('#')[0] ?? trimmed;
  const path = (withoutHash.split('?')[0] ?? '').toLowerCase();
  if (path.startsWith('/authentication')) return DEFAULT_RETURN;
  if (withoutHash.toLowerCase().includes('returnurl=')) return DEFAULT_RETURN;

  return trimmed;
}

export function isAuthenticationPath(url: string): boolean {
  const path = (url.split('?')[0] ?? '').split('#')[0] ?? '';
  return path.toLowerCase().startsWith('/authentication');
}
