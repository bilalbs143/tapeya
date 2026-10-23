/** Cooldown before download-app / app-update reminders may appear again (same as `app/`). */
export const REPEATING_DIALOG_REMINDER_COOLDOWN_MS = 4 * 60 * 1000;

const APP_UPDATE_REMINDER_KEY_PREFIX = 'tapeya_dialog_reminder_app_update_';

export function appUpdateReminderStorageKey(userId: string | number): string {
  return `${APP_UPDATE_REMINDER_KEY_PREFIX}${userId}`;
}

export function isDialogReminderCooldownElapsed(storageKey: string, cooldownMs: number): boolean {
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

export function markDialogReminderShown(storageKey: string): void {
  if (!storageKey) return;

  try {
    localStorage.setItem(storageKey, String(Date.now()));
  } catch {
    // private mode / quota
  }
}
