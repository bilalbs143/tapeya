import { useTeamCssVars } from './useTeamCssVars';

/**
 * Full-screen chrome — edge-to-edge viewport fill for FS graphics.
 * Injects session team colours as CSS custom properties (same contract as LowerThirdShell).
 *
 * @param {{ children: import('react').ReactNode, tokens?: import('../../types.js').ThemeTokens }} props
 */
export function FullScreenShell({ children, tokens }) {
  const style = useTeamCssVars(tokens);

  return (
    <div className="graphic-shell graphic-shell--fs pointer-events-none fixed inset-0 z-10 overflow-hidden" style={style}>
      {children}
    </div>
  );
}
