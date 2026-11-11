/** Payload for `.live-stream.chat.heart` (see LiveStreamHeartReceived). */
export type HeartEventPayload = {
  userId: number | null;
  avatarUrl: string | null;
  initials: string;
};

/** Map API `broadcastWith` shape to the UI payload. */
export function parseHeartEventPayload(raw: unknown): HeartEventPayload {
  const event = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  const userIdRaw = event?.user_id;
  const avatarRaw = event?.avatar_url;
  const initialsRaw = event?.initials;

  let userId: number | null = null;
  if (typeof userIdRaw === 'number' && Number.isFinite(userIdRaw)) {
    userId = userIdRaw;
  } else if (typeof userIdRaw === 'string' && userIdRaw.trim() !== '') {
    const n = Number(userIdRaw);
    if (Number.isFinite(n)) userId = n;
  }

  return {
    userId,
    avatarUrl: typeof avatarRaw === 'string' && avatarRaw.trim() ? avatarRaw : null,
    initials: typeof initialsRaw === 'string' && initialsRaw.trim() ? initialsRaw.trim() : '?',
  };
}
