import {
  APP_PATHS,
  isHighlightDetailPath,
  isLiveImmersivePath,
  isOperatorScoringPath,
  isReelsImmersivePath,
} from '@/shared/config/paths';

const DISMISSED_KEY_PREFIX = 'tapeya_interest_dialog_dismissed_';
const AUTO_SHOWN_KEY_PREFIX = 'tapeya_interest_dialog_auto_shown_';
const AUTH_PATHS = new Set<string>([APP_PATHS.login, APP_PATHS.register, APP_PATHS.otp]);
const INTEREST_FORM_PATH = /^\/interest\/[^/]+$/;

export function interestCampaignDialogDismissedKey(userId: string | number, slug: string): string {
  return `${DISMISSED_KEY_PREFIX}${userId}_${slug}`;
}

export function interestCampaignDialogAutoShownKey(userId: string | number, slug: string): string {
  return `${AUTO_SHOWN_KEY_PREFIX}${userId}_${slug}`;
}

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string): void {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // private mode / quota
  }
}

/** User closed the dialog (X / backdrop / Escape) — no auto-popup again this session. */
export function isInterestCampaignDialogDismissed(userId: string | number | null | undefined, slug: string): boolean {
  if (!userId || !slug) return false;
  return readFlag(interestCampaignDialogDismissedKey(userId, slug));
}

/** Auto-popup already fired this browser session — show at most once until session ends. */
export function isInterestCampaignDialogAutoShown(userId: string | number | null | undefined, slug: string): boolean {
  if (!userId || !slug) return false;
  return readFlag(interestCampaignDialogAutoShownKey(userId, slug));
}

export function markInterestCampaignDialogDismissed(userId: string | number | null | undefined, slug: string): void {
  if (!userId || !slug) return;
  writeFlag(interestCampaignDialogDismissedKey(userId, slug));
}

export function markInterestCampaignDialogAutoShown(userId: string | number | null | undefined, slug: string): void {
  if (!userId || !slug) return;
  writeFlag(interestCampaignDialogAutoShownKey(userId, slug));
}

/** Routes where the interest campaign dialog must not auto-open. */
export function isInterestCampaignDialogBlockedPath(pathname: string): boolean {
  return (
    AUTH_PATHS.has(pathname) ||
    pathname.startsWith('/overlay/') ||
    isLiveImmersivePath(pathname) ||
    isReelsImmersivePath(pathname) ||
    isHighlightDetailPath(pathname) ||
    isOperatorScoringPath(pathname) ||
    INTEREST_FORM_PATH.test(pathname)
  );
}
