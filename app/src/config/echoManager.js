import { createEcho } from '@/config/reverb';

/** @type {import('laravel-echo').default | null} */
let _echo = null;
let _refs = 0;
/** @type {string | null} */
let _authToken = null;

/**
 * Acquire a shared Echo instance (ref-counted).
 * Pass `authToken` when subscribing to private/presence channels on the same connection.
 *
 * @param {{ authToken?: string | null }} [options]
 * @returns {import('laravel-echo').default | null}
 */
export function acquireEcho({ authToken = null } = {}) {
  const token = authToken?.trim() || null;

  if (_echo && _authToken !== token) {
    _echo.disconnect();
    _echo = null;
    _refs = 0;
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

/** Release a ref; disconnect when the last subscriber leaves. */
export function releaseEcho() {
  if (_refs > 0) {
    _refs -= 1;
  }

  if (_refs <= 0 && _echo) {
    _echo.disconnect();
    _echo = null;
    _authToken = null;
    _refs = 0;
  }
}
