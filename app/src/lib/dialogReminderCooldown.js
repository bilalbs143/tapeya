/** Cooldown before download-app / app-update reminders may appear again. */
export const REPEATING_DIALOG_REMINDER_COOLDOWN_MS = 4 * 60 * 1000;

const DOWNLOAD_APP_REMINDER_KEY_PREFIX = 'tapeya_dialog_reminder_download_app_';
const APP_UPDATE_REMINDER_KEY_PREFIX = 'tapeya_dialog_reminder_app_update_';

/**
 * @param {string|number} userId
 * @returns {string}
 */
export function downloadAppReminderStorageKey(userId) {
  return `${DOWNLOAD_APP_REMINDER_KEY_PREFIX}${userId}`;
}

/**
 * @param {string|number} userId
 * @returns {string}
 */
export function appUpdateReminderStorageKey(userId) {
  return `${APP_UPDATE_REMINDER_KEY_PREFIX}${userId}`;
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
