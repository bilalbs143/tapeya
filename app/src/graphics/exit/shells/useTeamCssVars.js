/**
 * Maps session theme tokens to CSS custom properties for team colours.
 * Shared by LowerThirdShell and FullScreenShell.
 *
 * @param {import('../../types.js').ThemeTokens|undefined} tokens
 */
export function useTeamCssVars(tokens) {
  if (!tokens) return undefined;

  return {
    '--home-bg': tokens.homeBgColor || undefined,
    '--home-text': tokens.homeTextColor || undefined,
    '--away-bg': tokens.awayBgColor || undefined,
    '--away-text': tokens.awayTextColor || undefined,
  };
}
