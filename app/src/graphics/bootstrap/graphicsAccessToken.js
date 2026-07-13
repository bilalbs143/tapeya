/** Stateless graphics access token: {sessionId}-{expiresUnix}-{signatureHex64} */
export const GRAPHICS_ACCESS_TOKEN_PATTERN = /^(\d+)-(\d+)-([a-f0-9]{64})$/;

/**
 * @param {string|null|undefined} token
 * @returns {{ sessionId: string, expires: string, signature: string } | null}
 */
export function parseGraphicsAccessToken(token) {
  const match = String(token ?? '')
    .trim()
    .match(GRAPHICS_ACCESS_TOKEN_PATTERN);
  if (!match) return null;

  return {
    sessionId: match[1],
    expires: match[2],
    signature: match[3],
  };
}

/**
 * @param {{ sessionId: string, expires: string, signature: string }} parts
 * @returns {string}
 */
export function buildGraphicsAccessToken({ sessionId, expires, signature }) {
  return `${sessionId}-${expires}-${signature}`;
}
