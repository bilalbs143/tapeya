/**
 * Overlay-only shell — bar-rise animation and flash header slot.
 * Preview chrome stays in theme-controller's ControllerShell.
 */
import { OverlayLayoutProvider } from './overlayLayoutContext';

/**
 * @param {{
 *   stage?: 'bar' | 'full',
 *   header?: import('react').ReactNode | ((overlay: boolean) => import('react').ReactNode),
 *   children?: import('react').ReactNode | ((overlay: boolean) => import('react').ReactNode),
 *   overlayInset?: import('./overlayLayoutInsets.js').OverlayInsetVariant,
 *   isOverlay?: boolean,
 * }} props
 */
export function BroadcastShell({ stage = 'bar', header, children, overlayInset, isOverlay = false }) {
  const isFull = stage === 'full';
  const headerNode = typeof header === 'function' ? header(true) : header;
  const content = typeof children === 'function' ? children(true) : children;

  if (isFull) {
    return <div className="bc-controller-overlay-root bc-controller-overlay-root--full">{content}</div>;
  }

  const bar = <div className="bc-controller-bar-wrap animate-bar-rise w-full max-w-full overflow-hidden">{content}</div>;

  if (!overlayInset || !isOverlay) {
    return (
      <div className="bc-controller-overlay-root bc-controller-overlay-root--bar min-h-0 flex-1">
        {headerNode}
        {bar}
      </div>
    );
  }

  return (
    <OverlayLayoutProvider variant={overlayInset}>
      {headerNode}
      {bar}
    </OverlayLayoutProvider>
  );
}
