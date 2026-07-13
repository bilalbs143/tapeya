/**
 * Passthrough shell for animation-only commands (no LT/FS chrome metadata).
 * Accepts tokens for API consistency with other shells but does not inject CSS vars —
 * animation components own their own full-viewport visual.
 *
 * @param {{ children: import('react').ReactNode, tokens?: import('../../types.js').ThemeTokens }} props
 */
export function PassthroughShell({ children, tokens: _tokens }) {
  return (
    <div className="graphic-shell graphic-shell--passthrough pointer-events-none fixed top-0 right-0 bottom-0 left-0 z-10">
      {children}
    </div>
  );
}
