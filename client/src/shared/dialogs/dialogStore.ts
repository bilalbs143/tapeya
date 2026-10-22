import type { DialogKey, DialogProps } from './registry';

type OpenDialogEntry = { key: DialogKey; props: unknown; id: string };

let stack: OpenDialogEntry[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Module-level dialog stack — callable outside React (401 handler, push); React via `useSyncExternalStore`. §13 */
export const dialogStore = {
  getSnapshot: (): readonly OpenDialogEntry[] => stack,

  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  open<K extends DialogKey>(key: K, props: DialogProps<K>): string {
    const id = crypto.randomUUID();
    stack = [...stack, { key, props, id }];
    emit();
    return id;
  },

  /** Closes a specific dialog by id, or the top of the stack if no id is given. */
  close(id?: string): void {
    stack = id ? stack.filter((entry) => entry.id !== id) : stack.slice(0, -1);
    emit();
  },

  closeAll(): void {
    stack = [];
    emit();
  },
};
