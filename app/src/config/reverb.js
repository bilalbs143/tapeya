import { baseUrl } from '@/store/api/baseApi';

/**
 * WebSocket host/ports must be reachable from the browser (not localhost loopback in production).
 * Same idea as `backoffice/src/environments/environment.ts`: derive from the API origin.
 */
function deriveFromApiBase() {
  try {
    const apiOrigin = new URL(baseUrl);
    const useTls = apiOrigin.protocol === 'https:';
    const local =
      apiOrigin.hostname === 'localhost' ||
      apiOrigin.hostname === '127.0.0.1';
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
    /** Must equal `REVERB_APP_KEY` in `api/.env` */
    appKey: 'local-reverb-key',
    ...derived,
  };
}
