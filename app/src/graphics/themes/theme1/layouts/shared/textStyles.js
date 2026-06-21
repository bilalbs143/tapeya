/**
 * Theme1 broadcast text colors — two-color system only.
 *
 * Primary   (--text):            #ffffff   heroes, active names, scores, titles
 * Secondary (--text-secondary):  #dbe8ff   labels, roles, off-strike, metadata
 *
 * Hierarchy is primary vs secondary + font weight/size — no grey tokens.
 */

/** @type {string} */
export const TEXT_PRIMARY = 'text-[var(--text)]';

/** @type {string} */
export const TEXT_SECONDARY = 'text-[var(--text-secondary)]';
