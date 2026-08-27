/**
 * Handle OS / Capacitor deep links into the consumer app.
 * Routes are registered in {@link DEEP_LINK_ROUTES}.
 */

import { useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { dispatchDeepLinkNavigation } from '@/lib/deepLinks/deepLinkNavigation';
import { pathFromDeepLinkUrl } from '@/lib/deepLinks/deepLinkUtils';
import { isNative } from '@/platform/platform';

export function useAppDeepLink() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (!isNative()) return undefined;

    let listener;
    let cancelled = false;

    const openUrl = (url) => {
      if (cancelled) return;
      dispatchDeepLinkNavigation(navigate, pathFromDeepLinkUrl(url), {
        currentPath: locationRef.current.pathname,
      });
    };

    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;

      App.addListener('appUrlOpen', ({ url }) => {
        openUrl(url);
      }).then((l) => {
        if (cancelled) l.remove();
        else listener = l;
      });

      App.getLaunchUrl?.()
        .then((result) => {
          if (result?.url && !cancelled) openUrl(result.url);
        })
        .catch(() => {
          // getLaunchUrl unavailable on some platforms — ignore.
        });
    });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [navigate]);
}
