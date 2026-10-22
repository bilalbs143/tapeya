import { canUseComposeBackgrounds, COMPOSE_BACKGROUND_MAX_CHARS } from './composeBackgrounds';

export type CreatePostUiBackground = 'none' | 'turf' | 'floodlit';

export const POST_BODY_MAX_CHARS = 2200;

export function createPostApiBackgroundId(ui: CreatePostUiBackground): 'pitch' | 'night' | null {
  if (ui === 'turf') return 'pitch';
  if (ui === 'floodlit') return 'night';
  return null;
}

/** Illegal styled mode → render plain; keep selection for when caption shortens again. */
export function createPostActiveBackground(
  selected: CreatePostUiBackground,
  body: string,
  hasMedia: boolean
): CreatePostUiBackground {
  return canUseComposeBackgrounds(body, hasMedia) ? selected : 'none';
}

export function createPostCharLimit(withBackground: boolean): number {
  return withBackground ? COMPOSE_BACKGROUND_MAX_CHARS : POST_BODY_MAX_CHARS;
}

export function createPostCanPublish(body: string, hasMedia: boolean, overLimit: boolean): boolean {
  return !overLimit && (hasMedia || body.trim().length > 0);
}
