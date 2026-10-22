import { useSyncExternalStore } from 'react';

import { dialogStore } from './dialogStore';

/** Dialog store ↔ React bridge via `useSyncExternalStore`. §13.1 */
export function useDialogStack() {
  return useSyncExternalStore(dialogStore.subscribe, dialogStore.getSnapshot);
}
