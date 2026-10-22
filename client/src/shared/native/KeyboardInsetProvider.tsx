import { type ReactNode, useEffect } from 'react';

import { startKeyboardInsetTracking } from './keyboardInsetStore';

/** Mount once — starts keyboard inset tracking for `--keyboard-inset`. */
export function KeyboardInsetProvider({ children }: { children: ReactNode }) {
  useEffect(() => startKeyboardInsetTracking(), []);
  return children;
}
