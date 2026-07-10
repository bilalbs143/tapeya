import { createEcho } from '@/config/reverb';

/** @type {import('laravel-echo').default | null} */
let _echo = null;
let _refs = 0;
/** @type {string | null} */
let _authToken = null;

/**
 * Shared Echo for hub / presence / stream status (auth-capable).
 * Pass `authToken` when subscribing to private/presence channels on the same connection.
 *
 * Go-live owner chat uses a **separate** public Echo in `useBroadcastOwnerChat`
 * so this manager can never drop the broadcaster's comment/heart subscription.
 *
 * @param {{ authToken?: string | null }} [options]
 * @returns {import('laravel-echo').default | null}
 */
export function acquireEcho({ authToken = null } = {}) {
  const token = authToken?.trim() || null;

  if (_echo && _authToken !== token) {
    // Token changed (e.g. logged in mid-session) — rebuild, preserving refcount so
    // consumers that already hold a ref don't get disconnected out from under them.
    const prevRefs = _refs;
    try {
      _echo.disconnect();
    } catch {
      // ignore
    }
    _echo = null;
    _refs = prevRefs;
  }

  if (!_echo) {
    _echo = token ? createEcho({ authToken: token }) : createEcho();
    _authToken = token;
  }

  if (_echo) {
    _refs += 1;
  }

  return _echo;
}

export function releaseEcho() {
  if (_refs > 0) {
    _refs -= 1;
  }

  if (_refs <= 0 && _echo) {
    try {
      _echo.disconnect();
    } catch {
      // ignore
    }
    _echo = null;
    _authToken = null;
    _refs = 0;
  }
}
