/**
 * Returns 2-letter initials from a display name or nickname.
 *
 * @param {string} [name] - Full name
 * @param {string} [nickname] - If provided, used for initials instead of name
 * @returns {string}
 */
export function getInitials(name, nickname) {
  if (nickname) return nickname.slice(0, 2).toUpperCase();
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name || 'U').slice(0, 2).toUpperCase();
}

/**
 * Formats a number for display; returns '—' for null/undefined/empty.
 *
 * @param {number|string|null|undefined} n
 * @returns {string}
 */
export function formatNum(n) {
  if (n == null || n === '') return '—';
  if (typeof n === 'number' && Number.isFinite(n)) return String(n);
  return String(n);
}

/**
 * Formats a decimal to 2 dp; returns '—' for null/undefined/empty.
 *
 * @param {number|string|null|undefined} n
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatDecimal(n, decimals = 2) {
  if (n == null || n === '') return '—';
  if (typeof n === 'number' && Number.isFinite(n)) return n.toFixed(decimals);
  const parsed = Number(n);
  if (Number.isFinite(parsed)) return parsed.toFixed(decimals);
  return String(n);
}

/** Format a numeric count for display on notification/cart badges (e.g. "99+"). */
export function formatCountBadge(count, max = 99) {
  if (count <= 0) return null;
  return count > max ? `${max}+` : String(count);
}

/**
 * Returns {query, start} when the caret sits inside an active "@token", else null.
 * Token characters match {@link splitMentionSegments} (`[a-zA-Z0-9_]`).
 *
 * @param {string} value
 * @param {number} caret
 * @returns {{ query: string, start: number } | null}
 */
export function detectMentionTrigger(value, caret) {
  if (typeof value !== 'string' || !Number.isFinite(caret) || caret < 0) return null;
  const uptoCaret = value.slice(0, caret);
  const at = uptoCaret.lastIndexOf('@');
  if (at === -1) return null;
  const charBefore = at === 0 ? ' ' : uptoCaret[at - 1];
  if (!/\s/.test(charBefore)) return null;
  const token = uptoCaret.slice(at + 1);
  if (!/^[a-zA-Z0-9_]*$/.test(token)) return null;
  return { query: token, start: at };
}

/**
 * Splits text into segments around "@handle" mention tokens, for callers to render
 * each segment (e.g. highlighting `isMention` spans) without this file touching JSX.
 *
 * @param {string} [text]
 * @returns {Array<{ text: string, isMention: boolean }>}
 */
export function splitMentionSegments(text) {
  if (!text) return [];

  // Require start/whitespace before @ so emails (user@gmail.com) are not mentioned.
  const pattern = /(^|[\s])(@[a-zA-Z0-9_]+)/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const fullStart = match.index;
    const prefix = match[1] ?? '';
    const handle = match[2] ?? '';
    const handleStart = fullStart + prefix.length;

    if (handleStart > lastIndex) {
      segments.push({ text: text.slice(lastIndex, handleStart), isMention: false });
    }
    segments.push({ text: handle, isMention: true });
    lastIndex = handleStart + handle.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMention: false });
  }

  return segments.filter((segment) => segment.text !== '');
}
