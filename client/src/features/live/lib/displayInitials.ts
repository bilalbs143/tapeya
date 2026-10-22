/** 1–2 letter initials for chat/hearts when avatar missing. */
export function displayInitials(name?: string | null, nickname?: string | null): string {
  const nick = nickname?.trim();
  if (nick) return nick.slice(0, 2).toUpperCase();
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? '';
    const last = parts[parts.length - 1]?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }
  const solo = name?.trim();
  return solo ? solo.slice(0, 2).toUpperCase() : '?';
}
