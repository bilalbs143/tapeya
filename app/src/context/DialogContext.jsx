/**
 * DialogContext — unified single-slot dialog state for the entire app.
 *
 * Replaces the Redux dialogKey/dialogProps state and the useScoringDialogs hook.
 * Context (unlike Redux) allows function callbacks in props, making it suitable
 * for scoring dialogs that need to call back into scoring engine handlers.
 *
 * Usage:
 *   const { openDialog, closeDialog, dialogKey } = useDialog();
 *   openDialog('scoringOutReason', { dismissalOptions, onSelectOption: fn });
 *   closeDialog();
 */

import { createContext, useCallback, useContext, useState } from 'react';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({ key: null, props: {} });

  const openDialog = useCallback((key, props = {}) => {
    setDialog({ key, props });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ key: null, props: {} });
  }, []);

  return (
    <DialogContext.Provider
      value={{
        dialogKey: dialog.key,
        dialogProps: dialog.props,
        openDialog,
        closeDialog,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within <DialogProvider>');
  return ctx;
}
