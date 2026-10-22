import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { type InitialEntry, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import { baseApi } from '@/shared/api/baseApi';
import { ThemeProvider } from '@/shared/config/theme';
import { DialogHost } from '@/shared/dialogs';
import { authReducer } from '@/shared/store/authSlice';
import { ToastHost } from '@/shared/ui/toast';

/** Test harness: Redux + RTK Query + router + DialogHost. */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    initialEntries,
  }: {
    route?: string;
    /** Prefer this when you need `location.state` (auth OTP phone, etc.). */
    initialEntries?: InitialEntry[];
  } = {}
) {
  const store = configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider>
        <Provider store={store}>
          <MemoryRouter initialEntries={initialEntries ?? [route]}>
            {children}
            <DialogHost />
            <ToastHost />
          </MemoryRouter>
        </Provider>
      </ThemeProvider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
}
