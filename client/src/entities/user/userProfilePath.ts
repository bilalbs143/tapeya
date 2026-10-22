import { APP_PATHS } from '@/shared/config/paths';

/** Public profile URL — nickname or numeric id (lives here so avatars avoid importing profile). */

export function userProfilePath(user: { id: number; nickname?: string | null | undefined }): string {
  const handle = user.nickname?.trim();
  return `${APP_PATHS.user}/${encodeURIComponent(handle || String(user.id))}`;
}
