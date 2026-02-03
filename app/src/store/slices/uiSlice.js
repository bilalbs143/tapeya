import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  isSidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload ?? !state.isLoading;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setLoading, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
