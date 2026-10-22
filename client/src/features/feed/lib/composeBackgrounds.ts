/** Compose background API — omit `background_id` when plain, over 120 chars, or has media. */

/** Max body length that still shows / persists a styled background. */
export const COMPOSE_BACKGROUND_MAX_CHARS = 120;

export function canUseComposeBackgrounds(body: string, hasMedia: boolean): boolean {
  return !hasMedia && String(body ?? '').length <= COMPOSE_BACKGROUND_MAX_CHARS;
}

/** Value to send as `background_id` — `undefined` omits the field (plain text). */
export function resolveBackgroundIdForSubmit({
  backgroundId,
  body = '',
  hasMedia = false,
}: {
  backgroundId?: 'pitch' | 'night' | string | null | undefined;
  body?: string | undefined;
  hasMedia?: boolean | undefined;
}): 'pitch' | 'night' | undefined {
  if (!canUseComposeBackgrounds(body, hasMedia)) return undefined;
  if (backgroundId === 'pitch' || backgroundId === 'night') return backgroundId;
  return undefined;
}
