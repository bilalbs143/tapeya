import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { dispatchDeepLinkNavigation, pathFromDeepLinkUrl } from '@/shared/lib/deepLinks';
import { isNativePlatform } from '@/shared/platform/platform';

/** Capacitor `appUrlOpen` + cold-start launch URL → in-app navigation. */

export function useAppDeepLink() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!isNativePlatform()) return undefined;

    let remove: (() => void) | undefined;
    let cancelled = false;

    const openUrl = (url: string) => {
      if (cancelled) return;
      dispatchDeepLinkNavigation(navigate, pathFromDeepLinkUrl(url), {
        currentPath: locationRef.current,
      });
    };

    void import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;

      void App.addListener('appUrlOpen', ({ url }) => {
        openUrl(url);
      }).then((listener) => {
        if (cancelled) {
          void listener.remove();
          return;
        }
        remove = () => {
          void listener.remove();
        };
      });

      void App.getLaunchUrl?.()
        .then((result) => {
          if (result?.url && !cancelled) openUrl(result.url);
        })
        .catch(() => {
          // getLaunchUrl unavailable on some platforms — ignore.
        });
    });

    return () => {
      cancelled = true;
      remove?.();
    };
  }, [navigate]);
}
