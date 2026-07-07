const DISMISSED_KEY_PREFIX = 'tapeya_interest_dialog_dismissed_';
const AUTO_SHOWN_KEY_PREFIX = 'tapeya_interest_dialog_auto_shown_';

/**
 * @param {string|number} userId
 * @param {string} slug
 * @returns {string}
 */
export function interestCampaignDialogDismissedKey(userId, slug) {
  return `${DISMISSED_KEY_PREFIX}${userId}_${slug}`;
}

/**
 * @param {string|number} userId
 * @param {string} slug
 * @returns {string}
 */
export function interestCampaignDialogAutoShownKey(userId, slug) {
  return `${AUTO_SHOWN_KEY_PREFIX}${userId}_${slug}`;
}

/**
 * User closed the dialog (X / backdrop / Escape) — no auto-popup again this session.
 *
 * @param {string|number} userId
 * @param {string} slug
 * @returns {boolean}
 */
export function isInterestCampaignDialogDismissed(userId, slug) {
  if (!userId || !slug) return false;

  try {
    return sessionStorage.getItem(interestCampaignDialogDismissedKey(userId, slug)) === '1';
  } catch {
    return false;
  }
}

/**
 * Auto-popup already fired this browser session — show at most once until session ends.
 *
 * @param {string|number} userId
 * @param {string} slug
 * @returns {boolean}
 */
export function isInterestCampaignDialogAutoShown(userId, slug) {
  if (!userId || !slug) return false;

  try {
    return sessionStorage.getItem(interestCampaignDialogAutoShownKey(userId, slug)) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {string|number} userId
 * @param {string} slug
 */
export function markInterestCampaignDialogDismissed(userId, slug) {
  if (!userId || !slug) return;

  try {
    sessionStorage.setItem(interestCampaignDialogDismissedKey(userId, slug), '1');
  } catch {
    // private mode / quota
  }
}

/**
 * @param {string|number} userId
 * @param {string} slug
 */
export function markInterestCampaignDialogAutoShown(userId, slug) {
  if (!userId || !slug) return;

  try {
    sessionStorage.setItem(interestCampaignDialogAutoShownKey(userId, slug), '1');
  } catch {
    // private mode / quota
  }
}
