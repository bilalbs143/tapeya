import { useEffect } from 'react';

import { parseGraphicsAccessToken } from '@/graphics/bootstrap/graphicsAccessToken';

const WARNING_LEAD_MS = 15 * 60 * 1000;
/** setTimeout delay ceiling (~24.8 days) — guards against a very long admin-configured TTL. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Warns in the console ~15 minutes before a signed graphics access token expires.
 * The token embeds its own expiry (`{sessionId}-{expiresUnix}-{signature}`), so this
 * needs no API call. Without this, a token expiring mid-broadcast surfaces only as a
 * 403 on the next context refresh (see SignedGraphicsBootstrap) — this gives an
 * engineer watching the console a heads-up before that happens.
 *
 * @param {string|null|undefined} accessToken
 */
export function useTokenExpiryWarning(accessToken) {
  useEffect(() => {
    const parsed = parseGraphicsAccessToken(accessToken);
    if (!parsed) return undefined;

    const expiresAtMs = Number(parsed.expires) * 1000;
    if (!Number.isFinite(expiresAtMs)) return undefined;

    const delay = expiresAtMs - WARNING_LEAD_MS - Date.now();

    if (delay <= 0) {
      console.error(
        '[graphics] Heads up: this signed graphics URL expires within 15 minutes (or already has). Regenerate it soon to avoid an interruption mid-broadcast.',
      );
      return undefined;
    }

    const timer = setTimeout(
      () => {
        console.error(
          '[graphics] Heads up: this signed graphics URL expires in ~15 minutes. Regenerate it soon to avoid an interruption mid-broadcast.',
        );
      },
      Math.min(delay, MAX_TIMEOUT_MS),
    );

    return () => clearTimeout(timer);
  }, [accessToken]);
}
