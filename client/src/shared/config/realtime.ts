import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { env } from './env';

/** Echo/Reverb bootstrap — features import here, not laravel-echo directly. §7.3 */

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'unavailable' | 'failed';

export type RealtimeChannel = {
  listen: (event: string, callback: (payload: unknown) => void) => RealtimeChannel;
  stopListening: (event: string) => RealtimeChannel;
};

export type RealtimeClient = {
  /** Public channel (no auth). */
  channel: (name: string) => RealtimeChannel;
  private: (channel: string) => RealtimeChannel;
  leave: (channel: string) => void;
  disconnect: () => void;
  /** Pusher connection state changes. Returns unsubscribe. */
  onConnectionChange: (callback: (status: RealtimeConnectionStatus) => void) => () => void;
};

type CreateOptions = {
  /** Bearer token for private-channel `/broadcasting/auth`. */
  authToken?: string | null | undefined;
};

type ReverbConfig = {
  appKey: string;
  host: string;
  port: number;
  scheme: 'http' | 'https';
};

/** Dev/default key — must match `REVERB_APP_KEY` in `api/.env.example`. */
export const DEFAULT_REVERB_APP_KEY = 'local-reverb-key';

/**
 * Host/port/scheme when VITE_REVERB_* overrides are unset.
 * Reach WS via the API host (prod wss:443; local http → Reverb :8080).
 */
export function deriveReverbEndpointFromApiUrl(apiUrl: string): Pick<ReverbConfig, 'host' | 'port' | 'scheme'> | null {
  try {
    const api = new URL(apiUrl);
    const useTls = api.protocol === 'https:';
    const local = api.hostname === 'localhost' || api.hostname === '127.0.0.1';
    return {
      host: api.hostname,
      port: useTls ? 443 : local ? 8080 : 80,
      scheme: useTls ? 'https' : 'http',
    };
  } catch {
    return null;
  }
}

/** Resolve Reverb connection — optional overrides, otherwise API-derived defaults. */
export function resolveReverbConfig(
  options: {
    apiUrl?: string;
    appKey?: string | undefined;
    host?: string | undefined;
    port?: string | undefined;
    scheme?: 'http' | 'https' | undefined;
  } = {}
): ReverbConfig | null {
  const apiUrl = options.apiUrl ?? env.VITE_API_URL;
  const derived = deriveReverbEndpointFromApiUrl(apiUrl);
  if (!derived) return null;

  const appKey = (options.appKey ?? env.VITE_REVERB_APP_KEY)?.trim() || DEFAULT_REVERB_APP_KEY;
  const host = (options.host ?? env.VITE_REVERB_HOST)?.trim() || derived.host;
  const scheme = options.scheme ?? env.VITE_REVERB_SCHEME ?? derived.scheme;
  const rawPort = options.port ?? env.VITE_REVERB_PORT;
  const port = rawPort ? Number(rawPort) : derived.port;
  if (!Number.isFinite(port)) return null;

  return { appKey, host, port, scheme };
}

/** True when we can open a Reverb socket (API URL parseable). */
export function isRealtimeConfigured(): boolean {
  return resolveReverbConfig() != null;
}

type PusherConnection = {
  bind: (event: string, handler: (states: { current: string }) => void) => void;
  unbind: (event: string, handler: (states: { current: string }) => void) => void;
};

type EchoLike = {
  channel: (name: string) => unknown;
  private: (channel: string) => unknown;
  leave: (channel: string) => void;
  disconnect: () => void;
  connector?: { pusher?: { connection: PusherConnection } };
};

function normalizeConnectionStatus(raw: string): RealtimeConnectionStatus {
  switch (raw) {
    case 'connecting':
    case 'connected':
    case 'disconnected':
    case 'unavailable':
    case 'failed':
      return raw;
    default:
      return 'disconnected';
  }
}

function wrapEcho(echo: EchoLike): RealtimeClient {
  return {
    channel(name) {
      return echo.channel(name) as RealtimeChannel;
    },
    private(channel) {
      return echo.private(channel) as RealtimeChannel;
    },
    leave(channel) {
      echo.leave(channel);
    },
    disconnect() {
      echo.disconnect();
    },
    onConnectionChange(callback) {
      const pusher = echo.connector?.pusher;
      if (!pusher) return () => {};

      const handler = (states: { current: string }) => {
        callback(normalizeConnectionStatus(states.current));
      };
      pusher.connection.bind('state_change', handler);
      return () => {
        pusher.connection.unbind('state_change', handler);
      };
    },
  };
}

function createRealtimeClient(options: CreateOptions = {}): RealtimeClient | null {
  const reverb = resolveReverbConfig();
  if (!reverb) return null;

  let origin: string;
  try {
    origin = new URL(env.VITE_API_URL).origin;
  } catch {
    return null;
  }

  window.Pusher = Pusher;

  const echoOptions: Record<string, unknown> = {
    broadcaster: 'reverb',
    key: reverb.appKey,
    wsHost: reverb.host,
    wsPort: reverb.port,
    wssPort: reverb.port,
    forceTLS: reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
  };

  if (options.authToken) {
    echoOptions.authEndpoint = `${origin}/broadcasting/auth`;
    echoOptions.auth = {
      headers: {
        Authorization: `Bearer ${options.authToken}`,
        Accept: 'application/json',
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Echo constructor generics vary by package version.
  return wrapEcho(new Echo(echoOptions as any) as unknown as EchoLike);
}

type SharedRealtime = {
  client: RealtimeClient;
  authToken: string | null;
  refs: number;
};

let sharedRealtime: SharedRealtime | null = null;

/**
 * Ref-counted shared Echo — one socket for live chat/status + scoring/hub.
 * Pass the bearer when any subscriber needs private channels.
 */
export function acquireRealtimeClient(options: CreateOptions = {}): RealtimeClient | null {
  const authToken = options.authToken?.trim() || null;

  if (sharedRealtime && sharedRealtime.authToken !== authToken) {
    // Abandon the old socket; stale `releaseRealtimeClient(old)` calls no-op via identity check.
    sharedRealtime.client.disconnect();
    sharedRealtime = null;
  }

  if (!sharedRealtime) {
    const client = createRealtimeClient({ authToken });
    if (!client) return null;
    sharedRealtime = { client, authToken, refs: 0 };
  }

  sharedRealtime.refs += 1;
  return sharedRealtime.client;
}

/**
 * Drop a ref for the client this subscriber acquired.
 * Pass the acquired instance so token-swap cleanups cannot release a newer socket.
 */
export function releaseRealtimeClient(client: RealtimeClient): void {
  if (!sharedRealtime || sharedRealtime.client !== client) return;
  sharedRealtime.refs = Math.max(0, sharedRealtime.refs - 1);
  if (sharedRealtime.refs > 0) return;
  sharedRealtime.client.disconnect();
  sharedRealtime = null;
}
