import { BaseDialog } from './BaseDialog';
import { dialogStore } from './dialogStore';
import { DIALOG_COMPONENTS, DIALOG_CONTENT_CLASS_BY_KEY, DIALOG_SHOW_CLOSE_BY_KEY } from './registry';
import { useDialogStack } from './useDialog';

/** Single mount in `AppProviders` for all `dialogStore.open` calls. §13 */
export function DialogHost() {
  const stack = useDialogStack();
  const top = stack.at(-1);

  if (!top) return null;

  const DialogBody = DIALOG_COMPONENTS[top.key];
  const showClose = DIALOG_SHOW_CLOSE_BY_KEY[top.key] ?? true;

  return (
    <BaseDialog
      open
      showClose={showClose}
      onOpenAutoFocus={(event) => event.preventDefault()}
      onOpenChange={(open) => {
        if (open) return;
        if (top.key === 'sessionExpired') {
          forceSessionRelogin(top.props);
          return;
        }
        dialogStore.close(top.id);
      }}
      contentClassName={DIALOG_CONTENT_CLASS_BY_KEY[top.key] ?? ''}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous registry; DialogProps<K> keeps every *call site* fully typed, this is the one place the union collapses to render dynamically. */}
      <DialogBody {...(top.props as any)} />
    </BaseDialog>
  );
}

function forceSessionRelogin(props: unknown): void {
  const onLogIn = (props as { onLogIn?: () => void } | null)?.onLogIn;
  if (typeof onLogIn === 'function') {
    onLogIn();
    return;
  }
  dialogStore.closeAll();
}
