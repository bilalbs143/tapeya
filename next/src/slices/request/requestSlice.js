// store/slices/requestSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false, // Global loading state
  error: null, // Error message
  payload: null, // Response data for the last request
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload; // true/false
    },
    setError(state, action) {
      state.error = action.payload; // Error message
    },
    setPayload(state, action) {
      state.payload = action.payload; // API response data
    },
    resetRequestState(state) {
      state.loading = false;
      state.error = null;
      state.payload = null;
    },
  },
});

export const { setLoading, setError, setPayload, resetRequestState } =
  requestSlice.actions;

export default requestSlice.reducer;
