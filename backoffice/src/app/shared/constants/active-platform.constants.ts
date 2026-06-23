/**
 * Labels mirror {@see App\Enums\User\ActivePlatformEnum} — keep in sync when enum changes.
 */
export const ACTIVE_PLATFORM_LABELS: Record<string, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
  untracked: 'Untracked',
};

/** Stored platform values (excludes filter-only `untracked`). */
export const ACTIVE_PLATFORM_STORED_VALUES = ['web', 'ios', 'android'] as const;

export type ActivePlatformStored = (typeof ACTIVE_PLATFORM_STORED_VALUES)[number];
export type ActivePlatformFilter = ActivePlatformStored | 'untracked';
