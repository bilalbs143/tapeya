/// <reference types="vite/client" />

/** Laravel Echo's reverb broadcaster expects a global Pusher constructor. */
interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pusher is assigned from the pusher-js default export.
  Pusher: any;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_CDN_BASE: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_REVERB_APP_KEY?: string;
  readonly VITE_REVERB_HOST?: string;
  readonly VITE_REVERB_PORT?: string;
  readonly VITE_REVERB_SCHEME?: 'http' | 'https';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
