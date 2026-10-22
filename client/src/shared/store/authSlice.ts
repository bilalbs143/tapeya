import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Auth slice lives in shared so `baseApi` can read/clear token without importing features. §4 */
export type AuthCredentials = {
  accessToken: string;
  userId: number;
};

type AuthState = {
  accessToken: string | null;
  userId: number | null;
  /** False until secureStorage rehydrate finishes — prevents auth-guard flash. */
  hydrated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthCredentials>) {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.hydrated = true;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.userId = null;
      state.hydrated = true;
    },
    markAuthHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setCredentials, clearCredentials, markAuthHydrated } = authSlice.actions;
export const authReducer = authSlice.reducer;

export function selectAccessToken(state: { auth: AuthState }): string | null {
  return state.auth.accessToken;
}

export function selectIsAuthenticated(state: { auth: AuthState }): boolean {
  return state.auth.accessToken !== null;
}

export function selectAuthHydrated(state: { auth: AuthState }): boolean {
  return state.auth.hydrated;
}

export function selectUserId(state: { auth: AuthState }): number | null {
  return state.auth.userId;
}
