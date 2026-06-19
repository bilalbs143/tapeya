import { useTeamCssVars } from './useTeamCssVars';

/**
 * Lower-third chrome — positions content in the bottom strip region.
 * Theme command components render their own inner layout; the shell scopes OBS positioning.
 *
 * Injects session team colours as CSS custom properties so primitives can use
 * var(--home-bg), var(--home-text), var(--away-bg), var(--away-text) without
 * importing from session or config directly.
 *
 * @param {{ children: import('react').ReactNode, tokens?: import('../../types.js').ThemeTokens }} props
 */
export function LowerThirdShell({ children, tokens }) {
  const style = useTeamCssVars(tokens);

  return (
    <div
      className="graphic-shell graphic-shell--lt pointer-events-none fixed inset-0 z-10 flex items-end justify-stretch"
      style={style}
    >
      <div className="w-full">{children}</div>
    </div>
  );
}
