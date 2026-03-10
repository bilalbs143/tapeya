import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /** Global error message for non-auth API calls (e.g. toast) */
  globalError: null,
  /** Key-value state for cross-screen API-related data */
  meta: {},
  /** Global dialog key + props (managed by DialogManager) */
  dialogKey: null,
  dialogProps: null,
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
    openDialog: (state, action) => {
      const payload = action.payload;
      if (typeof payload === 'string') {
        state.dialogKey = payload;
        state.dialogProps = null;
      } else if (payload && typeof payload === 'object') {
        state.dialogKey = payload.key;
        state.dialogProps = payload.props || null;
      }
    },
    closeDialog: (state) => {
      state.dialogKey = null;
      state.dialogProps = null;
    },
  },
});

export const {
  setGlobalError,
  clearGlobalError,
  setMeta,
  clearMeta,
  openDialog,
  closeDialog,
} = commonSlice.actions;

export default commonSlice.reducer;
