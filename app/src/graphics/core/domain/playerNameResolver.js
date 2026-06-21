/**
 * Broadcast player-name formatting — theme-agnostic.
 *
 * Rules:
 * 1. Use at most two words (given + family) — drop middle/extra names.
 * 2. Any selected word longer than {@link MAX_BROADCAST_NAME_WORD_LENGTH} becomes an initial + period (e.g. "M.").
 *
 * Rationale: LTs and squad cards have fixed width; two tokens match how cricket broadcasts
 * introduce players (first + surname). Initials prevent long names from clipping or wrapping.
 */

/** Max characters per word before abbreviating to "X." */
export const MAX_BROADCAST_NAME_WORD_LENGTH = 12;

/** Number of name tokens shown on air (given + family). */
export const MAX_BROADCAST_NAME_WORDS = 2;

/**
 * @param {string} word
 */
function formatBroadcastWord(word) {
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
  const full = record.name ?? record.display_name ?? record.displayName ?? '';

  if (String(full).trim()) {
    return String(full).trim().split(/\s+/).filter(Boolean);
  }

  const first = record.firstName ?? record.first_name ?? '';
  const last = record.lastName ?? record.last_name ?? '';
  const parts = [];

  if (String(first).trim()) parts.push(...String(first).trim().split(/\s+/).filter(Boolean));
  if (String(last).trim()) parts.push(...String(last).trim().split(/\s+/).filter(Boolean));

  return parts;
}

/**
 * Two-word broadcast parts for stacked layouts (LT / FS hero card).
 *
 * @param {string|{ name?: string, firstName?: string, lastName?: string, first_name?: string, last_name?: string, display_name?: string, displayName?: string }} input
 * @returns {{ firstName: string, lastName: string, displayName: string }}
 */
export function resolveBroadcastNameParts(input) {
  const words = collectNameWords(input).slice(0, MAX_BROADCAST_NAME_WORDS);

  if (!words.length) {
    return { firstName: '', lastName: '', displayName: '' };
  }

  const firstName = formatBroadcastWord(words[0]);
  const lastName = words.length > 1 ? formatBroadcastWord(words[1]) : '';
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;

  return { firstName, lastName, displayName };
}

/**
 * Single-line broadcast name (squad lists, tables, chips).
 *
 * @param {string|{ name?: string, firstName?: string, lastName?: string, first_name?: string, last_name?: string, display_name?: string, displayName?: string }} input
 * @returns {string}
 */
export function resolveBroadcastPlayerName(input) {
  return resolveBroadcastNameParts(input).displayName;
}
