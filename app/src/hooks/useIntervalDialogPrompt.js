import { useEffect, useRef } from 'react';

import { useDialog } from '@/context/DialogContext';

/** Default cadence for repeating reminder dialogs (e.g. app update). */
export const DIALOG_REMINDER_INTERVAL_MS = 4 * 60 * 1000;

/**
 * While `enabled`, runs `getOpenDialogPayload` on a fixed interval. Opens a
 * dialog when the callback returns a payload and no dialog is currently open.
 *
 * @param {object} options
 * @param {number} options.intervalMs
 * @param {boolean} options.enabled
 * @param {() => null | { key: string, props?: object }} options.getOpenDialogPayload
 */
export function useIntervalDialogPrompt({ intervalMs, enabled, getOpenDialogPayload }) {
  const { openDialog, dialogKey } = useDialog();
  const getPayloadRef = useRef(getOpenDialogPayload);
  getPayloadRef.current = getOpenDialogPayload;
  const dialogKeyRef = useRef(dialogKey);
  dialogKeyRef.current = dialogKey;

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = () => {
      if (dialogKeyRef.current) return;
      const payload = getPayloadRef.current();
      if (payload) {
        openDialog(payload.key, payload.props ?? {});
      }
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [openDialog, enabled, intervalMs]);
}
