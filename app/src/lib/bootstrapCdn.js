/**
 * Apply public CDN base from system settings before the app module tree loads.
 *
 * Resilience (see incident: broken images app-wide until force-restart):
 * - The live settings fetch gets a timeout + short retry so a single transient
 *   blip at cold launch (very common — network stack not warm yet) doesn't fail.
 * - If the live fetch still can't complete, we prefer the last CDN base that
 *   actually worked (persisted locally) over the hardcoded legacy fallback in
 *   assets.js, which is a stale pre-migration origin missing newer uploads.
 * - If we end up on a non-fresh value, `watchForCdnRecovery` retries on the
 *   next native app foreground and reloads if it finds a corrected value, so
 *   a bad boot can self-heal without the user having to force-quit.
 */

import { baseUrl } from '@/lib/apiOrigin';
import { getCdnPublicBase, setCdnPublicBaseUrl } from '@/lib/constants/assets';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { isNative } from '@/platform/platform';

const LAST_GOOD_STORAGE_KEY = 'tapeya.cdnPublicBaseUrl';
const FETCH_TIMEOUT_MS = 2500;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

/** True once a boot/recovery attempt has resolved on something other than a fresh live fetch. */
let degraded = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCdnPublicBaseUrlOnce() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl}/system-settings`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const json = await response.json();
    const map = mapSystemSettingsByKey(json?.data ?? []);
    return map.cdn_public_base_url || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCdnPublicBaseUrlWithRetry() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const resolved = await fetchCdnPublicBaseUrlOnce();
    if (resolved) return resolved;
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
  }
  return null;
}

function readLastGoodCdnBase() {
  try {
    return localStorage.getItem(LAST_GOOD_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function writeLastGoodCdnBase(url) {
  try {
    localStorage.setItem(LAST_GOOD_STORAGE_KEY, url);
  } catch {
    // Storage unavailable (private mode, quota) — safe to no-op.
  }
}

export async function bootstrapCdnFromPublicSettings() {
  const resolved = await fetchCdnPublicBaseUrlWithRetry();

  if (resolved) {
    degraded = false;
    writeLastGoodCdnBase(resolved);
    setCdnPublicBaseUrl(resolved);
    return;
  }

  degraded = true;
  const lastGood = readLastGoodCdnBase();
  if (lastGood) {
    console.warn('[cdn] Settings unreachable at boot; using last-known-good CDN base:', lastGood);
    setCdnPublicBaseUrl(lastGood);
  } else {
    console.warn('[cdn] Settings unreachable at boot and no cached CDN base; using built-in fallback.');
    setCdnPublicBaseUrl('');
  }
}

/**
 * Re-check the CDN base when the app returns to the foreground. Only acts if
 * the last resolution was degraded; reloads if a fresh attempt finds a
 * corrected value, since the already-evaluated module tree can't pick it up
 * otherwise. No-ops (no network call) when we're already on a healthy value.
 */
export async function reattemptIfDegraded() {
  if (!degraded) return;
  const before = getCdnPublicBase();
  await bootstrapCdnFromPublicSettings();
  if (!degraded && getCdnPublicBase() !== before) {
    console.warn('[cdn] Recovered a corrected CDN base on resume; reloading.');
    window.location.reload();
  }
}

/**
 * Call once after boot to enable resume-triggered self-heal.
 * Native only: `resume` is a deliberate app-switch, low-frequency and safe to
 * reload through. On web, `visibilitychange` fires on every tab switch — far
 * too often to force a reload without risking losing whatever the user is
 * mid-way through — so a stale web session just self-heals on its next
 * natural page load instead.
 */
export function watchForCdnRecovery() {
  if (!isNative()) return;

  import('@capacitor/app').then(({ App }) => {
    App.addListener('resume', () => reattemptIfDegraded());
  });
}
