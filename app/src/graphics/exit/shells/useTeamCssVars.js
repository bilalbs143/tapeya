/**
 * Maps session theme tokens to CSS custom properties for team colours.
 * Shared by LowerThirdShell and FullScreenShell.
 */

/**
 * @param {import('../../types.js').ThemeTokens|undefined} tokens
 * @returns {import('react').CSSProperties|undefined}
 */
export function useTeamCssVars(tokens) {
  if (!tokens) return undefined;

  // CSS custom properties aren't part of the standard CSSProperties interface —
  // cast rather than let the structural "no common properties" check fire.
  return /** @type {import('react').CSSProperties} */ ({
    '--home-bg': tokens.homeBgColor || undefined,
    '--away-bg': tokens.awayBgColor || undefined,
    // Optional overrides when a theme schema still provides them.
    ...(tokens.homeTextColor ? { '--home-text': tokens.homeTextColor } : null),
    ...(tokens.awayTextColor ? { '--away-text': tokens.awayTextColor } : null),
    ...(tokens.textColor ? { '--text': tokens.textColor } : null),
  });
}
