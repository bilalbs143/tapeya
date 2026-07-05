import { parseGraphicsAccessToken } from './graphicsAccessToken';

/**
 * Parse the graphics.tapeya.com browser-source URL.
 * Path: /{sessionId}-{expiresUnix}-{signatureHex64}
 *
 * @param {{ pathname: string, search: string }} location
 * @returns {{ accessToken: string, sessionId: string, expires: string, signature: string } | null}
 */
export function parseGraphicsLocation(location) {
  const match = location.pathname.match(/^\/([^/]+)\/?$/);
  if (!match?.[1]) return null;

  const accessToken = decodeURIComponent(match[1]);
  const parsed = parseGraphicsAccessToken(accessToken);
  if (!parsed) return null;

  const expiresMs = Number(parsed.expires) * 1000;
  if (Number.isFinite(expiresMs) && expiresMs < Date.now()) {
    return { error: 'expired', accessToken, sessionId: parsed.sessionId, expires: parsed.expires };
  }

  return {
    accessToken,
    sessionId: parsed.sessionId,
    expires: parsed.expires,
    signature: parsed.signature,
  };
}
