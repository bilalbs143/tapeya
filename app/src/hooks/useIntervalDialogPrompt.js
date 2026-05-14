import { useEffect, useRef } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { openDialog } from '@/store/slices/commonSlice';
import { store } from '@/store/store';

/** Default cadence for repeating reminder dialogs (e.g. profile, app update). */
export const DIALOG_REMINDER_INTERVAL_MS = 2 * 60 * 1000;

/**
 * While `enabled`, runs `getOpenDialogPayload` on a fixed interval. Dispatches
 * `openDialog` when the callback returns a payload and no dialog is open.
 *
 * @param {object} options
 * @param {number} options.intervalMs
 * @param {boolean} options.enabled
 * @param {() => null | { key: string, props?: object }} options.getOpenDialogPayload
 */
export function useIntervalDialogPrompt({
  intervalMs,
  enabled,
  getOpenDialogPayload,
}) {
  const dispatch = useAppDispatch();
  const getPayloadRef = useRef(getOpenDialogPayload);
  getPayloadRef.current = getOpenDialogPayload;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const tick = () => {
      if (store.getState().common.dialogKey) {
        return;
      }
      const payload = getPayloadRef.current();
      if (payload) {
        dispatch(openDialog(payload));
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [dispatch, enabled, intervalMs]);
}
