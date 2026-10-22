/** Profile URL segment — all-digit → id, else nickname. */
export type ProfileHandle = { kind: 'id'; id: number } | { kind: 'nickname'; nickname: string };

export function parseProfileHandle(raw: string | undefined): ProfileHandle | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed);
    if (!Number.isFinite(id) || id <= 0) return null;
    return { kind: 'id', id };
  }
  return { kind: 'nickname', nickname: trimmed };
}

/** Prefer @handle in share/deep links when the profile has a nickname. */

export function profilePathSegment(user: { id: number; nickname?: string | null }): string {
  const handle = user.nickname?.trim();
  return handle || String(user.id);
}
