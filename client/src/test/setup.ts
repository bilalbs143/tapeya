import { afterAll, afterEach, beforeAll } from 'vitest';

import { dialogStore } from '@/shared/dialogs';
import { toastStore } from '@/shared/ui/toast';

import { server } from './server';

import '@testing-library/jest-dom/vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  dialogStore.closeAll();
  toastStore.clear();
});
afterAll(() => server.close());

// jsdom doesn't implement crypto.randomUUID by default in every environment;
// the dialog store (shared/dialogs/dialogStore.ts) relies on it.
if (!globalThis.crypto?.randomUUID) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polyfilling a global for the test environment only.
  (globalThis.crypto as any) = { ...globalThis.crypto, randomUUID: () => Math.random().toString(36).slice(2) };
}

// ThemeProvider reads prefers-color-scheme; jsdom has no matchMedia.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
