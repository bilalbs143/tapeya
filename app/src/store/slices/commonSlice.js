import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /** Global error message for non-auth API calls (e.g. toast) */
  globalError: null,
  /** Key-value state for cross-screen API-related data */
  meta: {},
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setGlobalError: (state, action) => {
      state.globalError = action.payload ?? null;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    setMeta: (state, action) => {
      const { key, value } = action.payload;
      state.meta[key] = value;
    },
    clearMeta: (state, action) => {
      if (action.payload) {
        delete state.meta[action.payload];
      } else {
        state.meta = {};
      }
    },
  },
});

export const { setGlobalError, clearGlobalError, setMeta, clearMeta } =
  commonSlice.actions;

export default commonSlice.reducer;
