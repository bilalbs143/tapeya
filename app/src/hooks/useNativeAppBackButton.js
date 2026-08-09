/**
 * Android hardware back. Without a listener, Capacitor only calls WebView.goBack()
 * when canGoBack — after a replace deep link that is often false, so back no-ops.
 */

import { useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import { getHistoryIdx, resolveNativeHardwareBackAction } from '@/lib/navigation/appBack';
import { hasOpenModalOverlay } from '@/lib/pullToRefresh';
import { isNative } from '@/platform/platform';

export function useNativeAppBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dialogKey, closeDialog } = useDialog();
  const locationRef = useRef(location);
  const dialogKeyRef = useRef(dialogKey);
  locationRef.current = location;
  dialogKeyRef.current = dialogKey;

  useEffect(() => {
    if (!isNative()) return undefined;

    let listener;
    let cancelled = false;

    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;

      App.addListener('backButton', () => {
        const action = resolveNativeHardwareBackAction({
          pathname: locationRef.current.pathname,
          historyIdx: getHistoryIdx(),
          hasDialog: Boolean(dialogKeyRef.current) || hasOpenModalOverlay(),
        });

        if (action.type === 'close-dialog') {
          if (dialogKeyRef.current) {
            closeDialog();
            return;
          }
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          return;
        }
        if (action.type === 'pop') {
          navigate(-1);
          return;
        }
        if (action.type === 'replace') {
          navigate(action.to, { replace: true });
          return;
        }
        App.exitApp();
      }).then((handle) => {
        if (cancelled) handle.remove();
        else listener = handle;
      });
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [closeDialog, navigate]);
}
