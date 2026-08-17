import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  consumeJustRegistered,
  consumePendingCompleteProfilePrompt,
  hasPendingCompleteProfilePrompt,
  markJustRegistered,
  markPendingCompleteProfilePrompt,
} from '../completeProfilePrompt';

function createFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('completeProfilePrompt', () => {
  beforeEach(() => {
    globalThis.localStorage = createFakeLocalStorage();
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  it('queues the prompt only after matching register → OTP phone', () => {
    markJustRegistered('+923001112233');
    expect(consumeJustRegistered('+92 300 111 2233')).toBe(true);
    expect(consumeJustRegistered('+923001112233')).toBe(false);

    markPendingCompleteProfilePrompt(42);
    expect(hasPendingCompleteProfilePrompt(42)).toBe(true);
    expect(consumePendingCompleteProfilePrompt(42)).toBe(true);
    expect(hasPendingCompleteProfilePrompt(42)).toBe(false);
    expect(consumePendingCompleteProfilePrompt(42)).toBe(false);
  });

  it('does not queue when OTP phone does not match register', () => {
    markJustRegistered('+923001112233');
    expect(consumeJustRegistered('+923009998877')).toBe(false);
    expect(consumeJustRegistered('+923001112233')).toBe(true);
  });
});
