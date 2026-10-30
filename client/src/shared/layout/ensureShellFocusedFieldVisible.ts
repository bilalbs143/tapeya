import { getKeyboardInset } from '@/shared/native/keyboardInsetStore';

import { PAGE_SCROLL_ATTR } from './PageDock';
import { SHELL_SCROLLPORT_ATTR } from './shellScroll';

const GAP_PX = 12;

function isEditable(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    if (el instanceof HTMLInputElement && (el.type === 'hidden' || el.type === 'submit' || el.type === 'button')) {
      return false;
    }
    return true;
  }
  return el.isContentEditable;
}

function nearestScrollport(from: Element): HTMLElement | null {
  return from.closest<HTMLElement>(`[${PAGE_SCROLL_ATTR}]`) ?? from.closest<HTMLElement>(`[${SHELL_SCROLLPORT_ATTR}]`);
}

/**
 * Scroll the nearest page/shell scroller so the focused field stays in view.
 * Skip PageDock footer / fill-stage fields — `paddingBottom` already keeps them visible.
 * No-op inside dialogs/sheets.
 */
export function ensureShellFocusedFieldVisible(): void {
  if (typeof document === 'undefined') return;

  const active = document.activeElement;
  if (!isEditable(active)) return;
  if (active.closest('[role="dialog"]')) return;
  if (active.closest('[data-page-dock]') && !active.closest(`[${PAGE_SCROLL_ATTR}]`)) return;

  const scrollport = nearestScrollport(active);
  if (!scrollport) return;

  const isPageScroll = scrollport.hasAttribute(PAGE_SCROLL_ATTR);
  const keyboardInset = isPageScroll ? 0 : getKeyboardInset();
  const obstacle = keyboardInset + GAP_PX;

  const portRect = scrollport.getBoundingClientRect();
  const fieldRect = active.getBoundingClientRect();
  const visibleBottom = portRect.bottom - obstacle;
  const visibleTop = portRect.top + GAP_PX;

  let delta = 0;
  if (fieldRect.bottom > visibleBottom) {
    delta = fieldRect.bottom - visibleBottom;
  } else if (fieldRect.top < visibleTop) {
    delta = fieldRect.top - visibleTop;
  }

  if (delta === 0) return;
  scrollport.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
}
