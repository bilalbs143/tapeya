/**
 * Short-text post backgrounds — keep in sync with
 * `App\Enums\Post\PostBackgroundId` (+ `plain` input → DB null).
 */

/** Max body length that still shows / persists a styled background. */
export const COMPOSE_BACKGROUND_MAX_CHARS = 120;

/** Persisted API / DB values (excludes plain). */
export const POST_BACKGROUND_IDS = [
  'pitch',
  'night',
  'gold',
  'balls',
  'wickets',
  'bats',
  'boundary',
  'century',
] as const;

export type PostBackgroundId = (typeof POST_BACKGROUND_IDS)[number];

/** Compose picker selection — plain stores as null. */
export type ComposeBackgroundUiId = 'plain' | PostBackgroundId;

/** Still renderable for existing posts; hidden from the compose picker. */
export const RETIRED_COMPOSE_BACKGROUND_IDS = ['bats'] as const;

export type ComposeBackgroundDef = {
  id: ComposeBackgroundUiId;
  label: string;
  /** Tailwind utility from `index.css` (`bg-post-*`). */
  surfaceClass: string;
  /** Optional inset wash. */
  overlayClass?: string | undefined;
  /** Text colour on the surface. */
  textClass: string;
  /** Decorative motif key (matches patternLayouts). */
  pattern?: PostBackgroundId | undefined;
};

const STYLED_TEXT = 'text-center text-[22px] leading-[1.4] font-bold max-w-[30ch] text-balance';

/** Catalog — plain + every persisted id (including retired). */
export const COMPOSE_TEXT_BACKGROUNDS: readonly ComposeBackgroundDef[] = [
  {
    id: 'plain',
    label: 'Plain',
    surfaceClass: 'bg-surface',
    textClass: 'text-ink',
  },
  {
    id: 'pitch',
    label: 'Turf',
    surfaceClass: 'bg-post-pitch',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'pitch',
  },
  {
    id: 'night',
    label: 'Floodlit',
    surfaceClass: 'bg-post-night',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'night',
  },
  {
    id: 'gold',
    label: 'Brand Gold',
    surfaceClass: 'bg-post-gold',
    overlayClass: 'bg-post-overlay-light',
    // Always dark on gold — don't follow theme ink (white in dark mode).
    textClass: `${STYLED_TEXT} text-[#080807]`,
    pattern: 'gold',
  },
  {
    id: 'balls',
    label: 'Tapeball',
    surfaceClass: 'bg-post-balls',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'balls',
  },
  {
    id: 'wickets',
    label: 'Champions',
    surfaceClass: 'bg-post-wickets',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'wickets',
  },
  {
    id: 'bats',
    label: 'Stadium Lights',
    surfaceClass: 'bg-post-bats',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'bats',
  },
  {
    id: 'boundary',
    label: 'Victory Ribbon',
    surfaceClass: 'bg-post-boundary',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'boundary',
  },
  {
    id: 'century',
    label: 'Century',
    surfaceClass: 'bg-post-century',
    overlayClass: 'bg-post-overlay-dark',
    textClass: `${STYLED_TEXT} text-white`,
    pattern: 'century',
  },
];

export const SELECTABLE_COMPOSE_TEXT_BACKGROUNDS = COMPOSE_TEXT_BACKGROUNDS.filter(
  (b) => !(RETIRED_COMPOSE_BACKGROUND_IDS as readonly string[]).includes(b.id)
);

const PERSISTED = new Set<string>(POST_BACKGROUND_IDS);

export function isPostBackgroundId(id: string | null | undefined): id is PostBackgroundId {
  return Boolean(id && PERSISTED.has(id));
}

const PLAIN_BACKGROUND: ComposeBackgroundDef = COMPOSE_TEXT_BACKGROUNDS[0] ?? {
  id: 'plain',
  label: 'Plain',
  surfaceClass: 'bg-surface',
  textClass: 'text-ink',
};

export function getComposeBackground(id: string | null | undefined): ComposeBackgroundDef {
  return COMPOSE_TEXT_BACKGROUNDS.find((b) => b.id === id) ?? PLAIN_BACKGROUND;
}

/** Non-plain background for feed/detail cards, or null. */
export function getFeedTextBackground(id: string | null | undefined): ComposeBackgroundDef | null {
  if (!id || id === 'plain' || !isPostBackgroundId(id)) return null;
  const bg = getComposeBackground(id);
  return bg.id === 'plain' ? null : bg;
}

export function canUseComposeBackgrounds(body: string, hasMedia: boolean): boolean {
  return !hasMedia && String(body ?? '').length <= COMPOSE_BACKGROUND_MAX_CHARS;
}

/** Value to send as `background_id` — `undefined` omits the field (plain text). */
export function resolveBackgroundIdForSubmit({
  backgroundId,
  body = '',
  hasMedia = false,
}: {
  backgroundId?: string | null | undefined;
  body?: string | undefined;
  hasMedia?: boolean | undefined;
}): PostBackgroundId | undefined {
  if (!canUseComposeBackgrounds(body, hasMedia)) return undefined;
  if (!backgroundId || backgroundId === 'plain') return undefined;
  if (!isPostBackgroundId(backgroundId)) return undefined;
  return backgroundId;
}
