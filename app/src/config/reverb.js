import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { baseUrl, getApiOrigin } from '@/lib/apiOrigin';

/**
 * WebSocket host/ports must be reachable from the browser (not localhost loopback in production).
 * Same idea as `backoffice/src/environments/environment.ts`: derive from the API origin.
 */
function deriveFromApiBase() {
  try {
    const apiOrigin = new URL(baseUrl);
    const useTls = apiOrigin.protocol === 'https:';
    const local = apiOrigin.hostname === 'localhost' || apiOrigin.hostname === '127.0.0.1';
    // Production HTTPS → WSS on 443. Local HTTP API → Reverb usually on 8080 (not the API port).
    const port = useTls ? 443 : local ? 8080 : 80;
    const scheme = useTls ? 'https' : 'http';
    return {
      host: apiOrigin.hostname,
      port,
      scheme,
    };
  } catch {
    return {
      host: 'localhost',
      port: 8080,
      scheme: 'http',
    };
  }
}

/**
 * @returns {{ enabled: boolean, appKey: string, host: string, port: number, scheme: string }}
 */
export function getReverbClientConfig() {
  const derived = deriveFromApiBase();
  return {
    enabled: true,
    /** Must equal `REVERB_APP_KEY` in `api/.env`. Override via `VITE_REVERB_APP_KEY` at build time. */
    appKey: import.meta.env.VITE_REVERB_APP_KEY || 'local-reverb-key',
    ...derived,
  };
}

/**
 * Creates and returns a configured Laravel Echo instance.
 *
 * @param {{ authToken?: string }} [options]
 *   Pass `authToken` to enable private-channel auth (`/broadcasting/auth`).
 *   Omit (or pass nothing) for public channels — no auth endpoint is set.
 * @returns {Echo<'reverb'>|null} null when Reverb is disabled or the API origin is unknown.
 */
export function createEcho({ authToken } = {}) {
  const reverb = getReverbClientConfig();
  if (!reverb.enabled) return null;

  const origin = getApiOrigin();
  if (!origin) return null;

  // Laravel Echo's 'reverb' broadcaster expects a global Pusher client (Reverb speaks the Pusher protocol).
  /** @type {any} */ (window).Pusher = Pusher;

  /** @type {any} */
  const options = {
    broadcaster: 'reverb',
    key: reverb.appKey,
    wsHost: reverb.host,
    wsPort: reverb.port,
    wssPort: reverb.port,
    forceTLS: reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
  };

  if (authToken) {
    options.authEndpoint = `${origin}/broadcasting/auth`;
    options.auth = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    };
  }

  return new Echo(options);
}
