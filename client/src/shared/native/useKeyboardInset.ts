import { useSyncExternalStore } from 'react';

import { getKeyboardInset, subscribeKeyboardInset } from './keyboardInsetStore';

/** Soft-keyboard height in px (0 when closed). Prefer CSS `var(--keyboard-inset)` in shared UI. */
export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribeKeyboardInset, getKeyboardInset, () => 0);
}
