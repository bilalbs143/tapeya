import { type ReactNode, Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ReelUploadProgressDialog } from '@/features/reels';

import { enumsApi } from '@/shared/api/enumsApi';
import { systemSettingsApi } from '@/shared/api/systemSettingsApi';
import { ThemeProvider } from '@/shared/config/theme';
import { DialogHost } from '@/shared/dialogs';
import { KeyboardInsetProvider } from '@/shared/native/KeyboardInsetProvider';
import { hideNativeSplash } from '@/shared/native/splash';
import { hydrateAuthSession } from '@/shared/store/authSession';
import { useAppDispatch } from '@/shared/store/hooks';
import { store } from '@/shared/store/store';
import { ToastHost } from '@/shared/ui/toast';

import { AppBootLoader } from './AppBootLoader';
import { ErrorBoundary } from './ErrorBoundary';
import { NativeEffects } from './NativeEffects';
import { ProgrammaticDialogPrompts } from './ProgrammaticDialogPrompts';
import { RealtimeEffects } from './RealtimeEffects';

type AppProvidersProps = {
  children: ReactNode;
};

function AuthHydration({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void (async () => {
      try {
        await hydrateAuthSession(dispatch);
      } catch {
        /* ignore */
      }
      await hideNativeSplash();
    })();
  }, [dispatch]);

  return children;
}

/** Warm public boot data so chips / CDN / OTP limits are ready early. */
function BootPrefetch({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(enumsApi.util.prefetch('getEnums', undefined, { force: false }));
    void dispatch(systemSettingsApi.util.prefetch('getPublicSystemSettings', undefined, { force: false }));
  }, [dispatch]);

  return children;
}

/** App-wide providers once — ThemeProvider before portals; DialogHost for `dialogStore.open`. */

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Provider store={store}>
          <BrowserRouter>
            <KeyboardInsetProvider>
              <AuthHydration>
                <BootPrefetch>
                  <Suspense fallback={<AppBootLoader />}>{children}</Suspense>
                  <NativeEffects />
                  <RealtimeEffects />
                  <ProgrammaticDialogPrompts />
                  <DialogHost />
                  <ReelUploadProgressDialog />
                  <ToastHost />
                </BootPrefetch>
              </AuthHydration>
            </KeyboardInsetProvider>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
