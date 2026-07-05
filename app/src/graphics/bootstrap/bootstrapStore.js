import './graphicSessionAccessApi';

import { configureStore } from '@reduxjs/toolkit';

import { graphicsBootstrapBaseApi } from './bootstrapBaseApi';

export const graphicsBootstrapStore = configureStore({
  reducer: {
    [graphicsBootstrapBaseApi.reducerPath]: graphicsBootstrapBaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(graphicsBootstrapBaseApi.middleware),
});

/** @typedef {typeof graphicsBootstrapStore.dispatch} GraphicsBootstrapDispatch */
