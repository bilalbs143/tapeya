const JUST_REGISTERED_KEY = 'tapeya_just_registered';
const PENDING_PREFIX = 'tapeya_complete_profile_pending_';
const JUST_REGISTERED_TTL_MS = 24 * 60 * 60 * 1000;

function phoneDigits(phone) {
  return String(phone ?? '').replace(/\D/g, '');
}

function pendingKey(userId) {
  return `${PENDING_PREFIX}${userId}`;
}

/**
 * Remember that this device just submitted the register form, so OTP verify
 * can queue the complete-profile popup for that account only.
 *
 * @param {string} phone
 */
export function markJustRegistered(phone) {
  const digits = phoneDigits(phone);
  if (!digits) return;

  try {
    localStorage.setItem(JUST_REGISTERED_KEY, JSON.stringify({ phoneKey: digits, at: Date.now() }));
  } catch {
    // private mode / quota
  }
}

/**
 * True when OTP is completing a registration started on this device.
 * Consumes the flag so a later login does not re-queue the popup.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export function consumeJustRegistered(phone) {
  const want = phoneDigits(phone);
  if (!want) return false;

  try {
    const raw = localStorage.getItem(JUST_REGISTERED_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    if (parsed?.phoneKey !== want) return false;
    if (!Number.isFinite(parsed.at) || Date.now() - parsed.at > JUST_REGISTERED_TTL_MS) {
      localStorage.removeItem(JUST_REGISTERED_KEY);
      return false;
    }

    localStorage.removeItem(JUST_REGISTERED_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string|number} userId
 */
export function markPendingCompleteProfilePrompt(userId) {
  if (userId == null || userId === '') return;

  try {
    localStorage.setItem(pendingKey(userId), '1');
  } catch {
    // private mode / quota
  }
}

/**
 * @param {string|number} userId
 * @returns {boolean}
 */
export function hasPendingCompleteProfilePrompt(userId) {
  if (userId == null || userId === '') return false;

  try {
    return localStorage.getItem(pendingKey(userId)) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {string|number} userId
 * @returns {boolean} true if a pending prompt was consumed
 */
export function consumePendingCompleteProfilePrompt(userId) {
  if (!hasPendingCompleteProfilePrompt(userId)) return false;

  try {
    localStorage.removeItem(pendingKey(userId));
  } catch {
    // private mode / quota
  }

  return true;
}
