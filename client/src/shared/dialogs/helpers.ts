import { dialogStore } from './dialogStore';
import type { DialogProps } from './registry';

/** Promise-based confirm — §13.3 */
export function confirm(props: Omit<DialogProps<'confirm'>, 'onConfirm' | 'onCancel'>): Promise<boolean> {
  return new Promise((resolve) => {
    const id = dialogStore.open('confirm', {
      ...props,
      onConfirm: () => {
        dialogStore.close(id);
        resolve(true);
      },
      onCancel: () => {
        dialogStore.close(id);
        resolve(false);
      },
    });
  });
}
