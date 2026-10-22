import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type { ZodType } from 'zod';

import { env } from './env';

/** Echo/Reverb bootstrap — features import here, not laravel-echo directly; `null` when Reverb env unset. §7.3 */

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

function apiOrigin(): string {
  try {
    return new URL(env.VITE_API_URL).origin;
  } catch {
    return '';
  }
}

function resolveReverbConfig(): ReverbConfig | null {
  const appKey = env.VITE_REVERB_APP_KEY;
  const host = env.VITE_REVERB_HOST;
  if (!appKey || !host) return null;

  const scheme = env.VITE_REVERB_SCHEME ?? (env.VITE_API_URL.startsWith('https') ? 'https' : 'http');
  const port = env.VITE_REVERB_PORT ? Number(env.VITE_REVERB_PORT) : scheme === 'https' ? 443 : 8080;
  if (!Number.isFinite(port)) return null;

  return { appKey, host, port, scheme };
}

/** True when VITE_REVERB_* is configured enough to attempt a socket. */
export function isRealtimeConfigured(): boolean {
  return resolveReverbConfig() != null;
}

/** Per-subscription client — use with bearer token for private channels. */
export function createRealtimeClient(options: CreateOptions = {}): RealtimeClient | null {
  const reverb = resolveReverbConfig();
  const origin = apiOrigin();
  if (!reverb || !origin) return null;

  window.Pusher = Pusher;

  // Echo's reverb broadcaster options are loosely typed across versions.
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
  const echo = new Echo(echoOptions as any);

  return {
    channel(name: string) {
      return echo.channel(name) as unknown as RealtimeChannel;
    },
    private(channel: string) {
      return echo.private(channel) as unknown as RealtimeChannel;
    },
    leave(channel: string) {
      echo.leave(channel);
    },
    disconnect() {
      echo.disconnect();
    },
    onConnectionChange(callback) {
      const pusher = (echo as unknown as { connector?: { pusher?: { connection: PusherConnection } } }).connector
        ?.pusher;
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

type PusherConnection = {
  bind: (event: string, handler: (states: { current: string }) => void) => void;
  unbind: (event: string, handler: (states: { current: string }) => void) => void;
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

let sharedClient: RealtimeClient | null | undefined;

/** Shared client without auth — private channels need `createRealtimeClient({ authToken })`. */
export function getRealtimeClient(): RealtimeClient | null {
  if (sharedClient !== undefined) return sharedClient;
  sharedClient = createRealtimeClient();
  return sharedClient;
}

/** Helper for feature listeners — parse once at the boundary. */
export function parseRealtimePayload<T>(schema: ZodType<T>, raw: unknown): T {
  return schema.parse(raw);
}
