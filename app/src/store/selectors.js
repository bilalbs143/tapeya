import { createSelector } from '@reduxjs/toolkit';

const selectAuthState = (state) => state.auth;
const selectUiState = (state) => state.ui;
const selectReelsState = (state) => state.reels;

export const selectUser = createSelector([selectAuthState], (auth) => auth.user);

export const selectIsAuthenticated = createSelector([selectAuthState], (auth) => auth.isAuthenticated);

export const selectAccessToken = createSelector([selectAuthState], (auth) => auth.accessToken);

export const selectAuthUserAndToken = createSelector([selectAuthState], (auth) => ({
  user: auth?.user,
  accessToken: auth?.accessToken,
}));

export const selectIsLoading = createSelector([selectUiState], (ui) => ui.isLoading);

export const selectIsSidebarOpen = createSelector([selectUiState], (ui) => ui.isSidebarOpen);

export const selectPublishedReels = createSelector([selectReelsState], (reels) => reels?.publishedReels ?? []);
