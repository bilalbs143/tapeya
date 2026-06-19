/**
 * Overlay-only shell — bar-rise animation and flash header slot.
 * Preview chrome stays in theme-controller's ControllerShell.
 */
export function BroadcastShell({ stage = 'bar', header, children }) {
  const isFull = stage === 'full';
  const headerNode = typeof header === 'function' ? header(true) : header;
  const content = typeof children === 'function' ? children(true) : children;

  if (isFull) {
    return <div className="bc-controller-overlay-root bc-controller-overlay-root--full">{content}</div>;
  }

  const bar = <div className="bc-controller-bar-wrap animate-bar-rise w-full max-w-full overflow-hidden">{content}</div>;

  return (
    <div className="bc-controller-overlay-root bc-controller-overlay-root--bar min-h-0 flex-1">
      {headerNode}
      {bar}
    </div>
  );
}
