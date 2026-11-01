import type { MouseEvent } from 'react';

/** AppShell column — set by `ShellScrollport`. */
export const SHELL_SCROLLPORT_ATTR = 'data-shell-scrollport';

/** Mark page-owned scroll regions for shell scroll-to-top. */
export const SCROLL_TO_TOP_ATTR = 'data-scroll-to-top';

/** Home feed / document-scroll pages — IntersectionObserver root (not the window). */
export function getShellScrollRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>(`[${SHELL_SCROLLPORT_ATTR}]`);
}

/** Scroll shell + `[data-scroll-to-top]` regions to top. */
export function scrollShellToTop(behavior: ScrollBehavior = 'smooth'): void {
  if (typeof document === 'undefined') return;

  const nodes = document.querySelectorAll<HTMLElement>(`[${SHELL_SCROLLPORT_ATTR}], [${SCROLL_TO_TOP_ATTR}]`);
  for (const node of nodes) {
    if (node.scrollTop === 0) continue;
    node.scrollTo({ top: 0, left: 0, behavior });
  }
  window.scrollTo({ top: 0, left: 0, behavior });
}

/** Re-tap same nav root — scroll to top instead of remounting. */
export function handleNavRootReselect(
  event: Pick<MouseEvent, 'preventDefault'>,
  pathname: string,
  to: string
): boolean {
  if (pathname !== to) return false;
  event.preventDefault();
  scrollShellToTop('smooth');
  return true;
}
