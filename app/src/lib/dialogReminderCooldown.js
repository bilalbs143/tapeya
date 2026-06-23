/** Cooldown before the incomplete-profile reminder may appear again. */
export const PROFILE_STRENGTH_REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const PROFILE_STRENGTH_REMINDER_KEY_PREFIX = 'tapeya_dialog_reminder_profile_strength_';

/**
 * @param {string|number} userId
 * @returns {string}
 */
export function profileStrengthReminderStorageKey(userId) {
  return `${PROFILE_STRENGTH_REMINDER_KEY_PREFIX}${userId}`;
}

/**
 * @param {string} storageKey
 * @param {number} cooldownMs
 * @returns {boolean}
 */
export function isDialogReminderCooldownElapsed(storageKey, cooldownMs) {
  if (!storageKey) return false;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return true;

    const lastShown = Number(raw);
    if (!Number.isFinite(lastShown)) return true;

    return Date.now() - lastShown >= cooldownMs;
  } catch {
    return true;
  }
}

/**
 * @param {string} storageKey
 */
export function markDialogReminderShown(storageKey) {
  if (!storageKey) return;

  try {
    localStorage.setItem(storageKey, String(Date.now()));
  } catch {
    // private mode / quota
  }
}
