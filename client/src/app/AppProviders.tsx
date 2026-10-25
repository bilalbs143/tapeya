import { type ReactNode, Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { TermsAcceptanceGate } from '@/features/auth';
import { ReelUploadProgressDialog } from '@/features/reels';

import { enumsApi } from '@/shared/api/enumsApi';
import { ThemeProvider } from '@/shared/config/theme';
import { DialogHost } from '@/shared/dialogs';
import { KeyboardInsetProvider } from '@/shared/native/KeyboardInsetProvider';
import { hideNativeSplash, scheduleNativeSplashFailsafe } from '@/shared/native/splash';
import { hydrateAuthSession } from '@/shared/store/authSession';
import { useAppDispatch } from '@/shared/store/hooks';
import { store } from '@/shared/store/store';
import { ToastHost } from '@/shared/ui/toast';

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
    scheduleNativeSplashFailsafe();
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

/** Warm public `GET /enums` so profile / quick-match chips have labels immediately. */

function EnumsPrefetch({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(enumsApi.util.prefetch('getEnums', undefined, { force: false }));
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
                <EnumsPrefetch>
                  <Suspense fallback={<div className="text-muted p-8 text-sm">Loading…</div>}>{children}</Suspense>
                  <NativeEffects />
                  <RealtimeEffects />
                  <ProgrammaticDialogPrompts />
                  <DialogHost />
                  <TermsAcceptanceGate />
                  <ReelUploadProgressDialog />
                  <ToastHost />
                </EnumsPrefetch>
              </AuthHydration>
            </KeyboardInsetProvider>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
