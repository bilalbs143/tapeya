import { APP_PATHS } from '@/shared/config/paths';

/** In-app public profile URL — `/users/:id` (not nickname). */

export function userProfilePath(user: { id: number; nickname?: string | null | undefined }): string {
  return `${APP_PATHS.user}/${user.id}`;
}
