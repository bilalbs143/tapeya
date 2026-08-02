/**
 * Short-text post backgrounds (Tapeya brand/surface palette).
 * IDs persist on posts.background_id (null / omitted = plain).
 *
 * Keep COMPOSE_BACKGROUND_INPUT_IDS in sync with
 * `App\Enums\Post\PostBackgroundId::inputValues()` on the API.
 *
 * Styled surfaces use deterministic outline motifs around the edges so compose
 * preview and published feed cards match. See TextPostBackground + cricketPatternLayouts.
 */

/** Max body length that still shows / persists a styled background. */
export const COMPOSE_BACKGROUND_MAX_CHARS = 120;

/**
 * Allowed compose `background_id` values (includes plain → API stores null).
 * Must match PostBackgroundId::inputValues().
 */
export const COMPOSE_BACKGROUND_INPUT_IDS = [
  'plain',
  'pitch',
  'night',
  'gold',
  'balls',
  'wickets',
  'bats',
  'boundary',
  'century',
];

/** Persisted DB values (excludes plain). Matches PostBackgroundId::values(). */
export const PERSISTED_BACKGROUND_IDS = COMPOSE_BACKGROUND_INPUT_IDS.filter((id) => id !== 'plain');

/**
 * Still renderable for existing posts, but hidden from the compose picker.
 * Keep entries in COMPOSE_TEXT_BACKGROUNDS / CRICKET_PATTERN_LAYOUTS.
 */
export const RETIRED_COMPOSE_BACKGROUND_IDS = ['bats'];

/** Shared typography for styled text posts (compose preview + feed/detail). */
const STYLED_TEXT_CLASS = 'text-center text-[22px] leading-[1.4] font-bold max-w-[30ch] text-balance';

export const COMPOSE_TEXT_BACKGROUNDS = [
  {
    id: 'plain',
    label: 'Plain',
    className: 'bg-surface',
  },
  {
    id: 'pitch',
    label: 'Turf',
    className:
      'bg-[radial-gradient(circle_at_12%_0%,rgba(110,245,175,0.20),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(218,152,17,0.15),transparent_40%),linear-gradient(145deg,#0d5238_0%,#12613e_48%,#07291e_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(0,0,0,0.13),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'pitch',
  },
  {
    id: 'night',
    label: 'Floodlit',
    className:
      'bg-[radial-gradient(circle_at_12%_-8%,rgba(129,140,248,0.38),transparent_42%),radial-gradient(circle_at_96%_105%,rgba(56,189,248,0.22),transparent_44%),linear-gradient(150deg,#17143d_0%,#29265f_48%,#0b1029_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(0,0,0,0.15),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'night',
  },
  {
    id: 'gold',
    label: 'Brand Gold',
    // text-ink (#080807) on brand gold — intentional high-contrast Tapeya treatment
    className:
      'bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.38),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(117,67,0,0.18),transparent_44%),linear-gradient(145deg,#f0b94a_0%,var(--color-brand)_48%,#c88408_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(255,245,214,0.13),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-ink`,
    pattern: 'gold',
  },
  {
    id: 'balls',
    label: 'Tapeball',
    className:
      'bg-[radial-gradient(circle_at_8%_-5%,rgba(240,185,74,0.20),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(218,152,17,0.12),transparent_42%),linear-gradient(145deg,#292015_0%,#18130d_52%,#090a08_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(0,0,0,0.12),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'balls',
  },
  {
    id: 'wickets',
    label: 'Champions',
    className:
      'bg-[radial-gradient(circle_at_90%_-5%,rgba(255,213,128,0.18),transparent_40%),radial-gradient(circle_at_0%_100%,rgba(218,152,17,0.13),transparent_42%),linear-gradient(145deg,#593512_0%,#754819_47%,#281706_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(20,8,0,0.14),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'wickets',
  },
  {
    id: 'bats',
    label: 'Stadium Lights',
    className:
      'bg-[radial-gradient(ellipse_60%_40%_at_12%_-10%,rgba(255,247,220,0.14),transparent_60%),radial-gradient(ellipse_60%_40%_at_88%_-10%,rgba(255,247,220,0.10),transparent_60%),linear-gradient(160deg,#1a1712_0%,#2a2318_45%,#0d0c09_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(0,0,0,0.13),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'bats',
  },
  {
    id: 'boundary',
    label: 'Victory Ribbon',
    className:
      'bg-[radial-gradient(circle_at_8%_-8%,rgba(251,146,60,0.23),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(244,63,94,0.18),transparent_42%),linear-gradient(145deg,#711b24_0%,#961d2c_48%,#3b0c13_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(35,0,5,0.13),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'boundary',
  },
  {
    id: 'century',
    label: 'Century',
    className:
      'bg-[radial-gradient(circle_at_10%_-8%,rgba(240,185,74,0.24),transparent_40%),radial-gradient(circle_at_100%_105%,rgba(217,70,239,0.16),transparent_44%),linear-gradient(145deg,#4d193c_0%,#682750_48%,#250b1e_100%)]',
    overlayClassName: 'bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(20,0,15,0.13),transparent_72%)]',
    textClassName: `${STYLED_TEXT_CLASS} text-white`,
    pattern: 'century',
  },
];

/**
 * Backgrounds offered for new posts. Retired IDs remain in COMPOSE_TEXT_BACKGROUNDS
 * so existing posts keep rendering.
 */
export const SELECTABLE_COMPOSE_TEXT_BACKGROUNDS = COMPOSE_TEXT_BACKGROUNDS.filter(
  ({ id }) => !RETIRED_COMPOSE_BACKGROUND_IDS.includes(id),
);

/** @deprecated Prefer COMPOSE_BACKGROUND_INPUT_IDS — same values. */
export const COMPOSE_BACKGROUND_IDS = COMPOSE_TEXT_BACKGROUNDS.map((b) => b.id);

export function getComposeBackground(id) {
  return COMPOSE_TEXT_BACKGROUNDS.find((b) => b.id === id) ?? COMPOSE_TEXT_BACKGROUNDS[0];
}

/** Non-plain background for feed/detail cards, or null. */
export function getFeedTextBackground(id) {
  if (!id || id === 'plain') return null;
  const bg = COMPOSE_TEXT_BACKGROUNDS.find((b) => b.id === id);
  return bg && bg.id !== 'plain' ? bg : null;
}

/**
 * Whether compose may show / apply a styled background.
 *
 * @param {string} body
 * @param {boolean} hasMedia
 */
export function canUseComposeBackgrounds(body, hasMedia) {
  return !hasMedia && String(body ?? '').length <= COMPOSE_BACKGROUND_MAX_CHARS;
}

/**
 * Value to send as `background_id` on text compose (omit / undefined when plain).
 *
 * @param {{ backgroundId?: string, body?: string, hasMedia?: boolean }} args
 * @returns {string|undefined}
 */
export function resolveBackgroundIdForSubmit({ backgroundId, body = '', hasMedia = false } = {}) {
  if (!canUseComposeBackgrounds(body, hasMedia)) return undefined;
  if (!backgroundId || backgroundId === 'plain') return undefined;
  if (!PERSISTED_BACKGROUND_IDS.includes(backgroundId)) return undefined;
  return backgroundId;
}
