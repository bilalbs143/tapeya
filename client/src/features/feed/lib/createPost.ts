import {
  canUseComposeBackgrounds,
  COMPOSE_BACKGROUND_MAX_CHARS,
  type ComposeBackgroundUiId,
  type PostBackgroundId,
} from './composeBackgrounds';

export type CreatePostUiBackground = ComposeBackgroundUiId;

export const POST_BODY_MAX_CHARS = 2200;

/** UI selection → API id (plain → null). */
export function createPostApiBackgroundId(ui: CreatePostUiBackground): PostBackgroundId | null {
  return ui === 'plain' ? null : ui;
}

/** Illegal styled mode → render plain; keep selection for when caption shortens again. */
export function createPostActiveBackground(
  selected: CreatePostUiBackground,
  body: string,
  hasMedia: boolean
): CreatePostUiBackground {
  return canUseComposeBackgrounds(body, hasMedia) ? selected : 'plain';
}

export function createPostCharLimit(withBackground: boolean): number {
  return withBackground ? COMPOSE_BACKGROUND_MAX_CHARS : POST_BODY_MAX_CHARS;
}

export function createPostCanPublish(body: string, hasMedia: boolean, overLimit: boolean): boolean {
  return !overLimit && (hasMedia || body.trim().length > 0);
}
