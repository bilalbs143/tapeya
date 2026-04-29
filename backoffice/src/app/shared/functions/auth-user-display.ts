import type { AuthUser } from 'src/app/models/auth.models';

/** Display name for header / sidebar profile (signed-in backoffice user). */
export function authUserDisplayName(user: AuthUser | null | undefined): string {
  return user?.name?.trim() || 'User';
}

/** Backoffice `AuthUser.is_admin` (full administrator / platform operator shell). */
export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.is_admin === true;
}

/** Human-readable role line for profile UI (matches backoffice `AuthUser` flags). */
export function authUserDisplayRole(user: AuthUser | null | undefined): string {
  if (!user) {
    return '';
  }
  if (user.is_admin) {
    return 'Administrator';
  }
  if (user.is_broadcast_staff) {
    return 'Broadcast Staff';
  }
  const raw = user.type_enum ?? user.type;
  if (!raw) {
    return 'User';
  }
  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
