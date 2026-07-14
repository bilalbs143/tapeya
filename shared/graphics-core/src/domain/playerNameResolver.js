/**
 * Broadcast player-name formatting — theme-agnostic.
 *
 * Two styles (adapters/layouts must pick explicitly by surface):
 * - {@link BROADCAST_NAME_STYLE.compact} — lower thirds (NAME_LT, MATCH_LT, FOW, LT_DEFAULT, …)
 * - {@link BROADCAST_NAME_STYLE.standard} — full-screen (NAME_FS, squads, MOM, charts, …)
 *
 * Shared: at most two words; drop 3rd+.
 */

/** Max characters per word before abbreviating to "X." (standard style only). */
export const MAX_BROADCAST_NAME_WORD_LENGTH = 12;

/** Number of name tokens shown on air. */
export const MAX_BROADCAST_NAME_WORDS = 2;

/** @typedef {'compact'|'standard'} BroadcastNameStyle */

export const BROADCAST_NAME_STYLE = /** @type {const} */ ({
  compact: 'compact',
  standard: 'standard',
});

/**
 * @param {string} word
 * @returns {string}
 */
function toInitial(word) {
  const trimmed = String(word ?? '').trim();
  if (!trimmed) return '';
  return trimmed[0].toUpperCase();
}

/**
 * @param {string} word
 * @returns {string}
 */
function formatStandardWord(word) {
  const trimmed = String(word ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.length > MAX_BROADCAST_NAME_WORD_LENGTH) {
    return `${trimmed[0].toUpperCase()}.`;
  }
  return trimmed;
}

/**
 * @param {string|{ name?: string, firstName?: string, lastName?: string, first_name?: string, last_name?: string, display_name?: string, displayName?: string }} input
 * @returns {string[]}
 */
export function collectNameWords(input) {
  if (typeof input === 'string') {
    return input.trim().split(/\s+/).filter(Boolean);
  }

  const record = input ?? {};
  const first = record.firstName ?? record.first_name ?? '';
  const last = record.lastName ?? record.last_name ?? '';
  const fromParts = [];

  if (String(first).trim()) fromParts.push(...String(first).trim().split(/\s+/).filter(Boolean));
  if (String(last).trim()) fromParts.push(...String(last).trim().split(/\s+/).filter(Boolean));

  const full = record.name ?? record.display_name ?? record.displayName ?? '';
  const fromFull = String(full).trim() ? String(full).trim().split(/\s+/).filter(Boolean) : [];

  // Prefer first/last when the combined label is only a surname-style single token.
  if (fromParts.length >= 2 && fromFull.length <= 1) {
    return fromParts;
  }

  if (fromFull.length) return fromFull;
  return fromParts;
}

/**
 * Compact (LT): first initial + full second word (e.g. "M Bilal").
 *
 * @param {string[]} words — already sliced to max two
 * @returns {{ firstName: string, lastName: string, displayName: string }}
 */
function resolveCompactParts(words) {
  if (!words.length) {
    return { firstName: '', lastName: '', displayName: '' };
  }

  if (words.length === 1) {
    const firstName = words[0];
    return { firstName, lastName: '', displayName: firstName };
  }

  const firstName = toInitial(words[0]);
  const lastName = words[1];
  return { firstName, lastName, displayName: `${firstName} ${lastName}` };
}

/**
 * Standard (FS): full words, with length-based initial for very long tokens.
 * Single-word names sit on lastName so stacked FS heroes keep the large type.
 *
 * @param {string[]} words — already sliced to max two
 * @returns {{ firstName: string, lastName: string, displayName: string }}
 */
function resolveStandardParts(words) {
  if (!words.length) {
    return { firstName: '', lastName: '', displayName: '' };
  }

  if (words.length === 1) {
    const lastName = formatStandardWord(words[0]);
    return { firstName: '', lastName, displayName: lastName };
  }

  const firstName = formatStandardWord(words[0]);
  const lastName = formatStandardWord(words[1]);
  const displayName = `${firstName} ${lastName}`;

  return { firstName, lastName, displayName };
}

/**
 * Two-word broadcast parts for stacked layouts (LT / FS hero card).
 *
 * @param {string|{ name?: string, firstName?: string, lastName?: string, first_name?: string, last_name?: string, display_name?: string, displayName?: string }} input
 * @param {BroadcastNameStyle} [style='compact']
 * @returns {{ firstName: string, lastName: string, displayName: string }}
 */
export function resolveBroadcastNameParts(input, style = BROADCAST_NAME_STYLE.compact) {
  const words = collectNameWords(input).slice(0, MAX_BROADCAST_NAME_WORDS);

  if (style === BROADCAST_NAME_STYLE.standard) {
    return resolveStandardParts(words);
  }

  return resolveCompactParts(words);
}

/**
 * Single-line broadcast name (squad lists, tables, chips).
 *
 * @param {string|{ name?: string, firstName?: string, lastName?: string, first_name?: string, last_name?: string, display_name?: string, displayName?: string }} input
 * @param {BroadcastNameStyle} [style='compact']
 * @returns {string}
 */
export function resolveBroadcastPlayerName(input, style = BROADCAST_NAME_STYLE.compact) {
  return resolveBroadcastNameParts(input, style).displayName;
}
