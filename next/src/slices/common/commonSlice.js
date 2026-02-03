import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSide: true,
  websiteLoader: false,
  currentModal: null, // To track the open modal
  modalProps: null,
  isLoading: false,
  isError: false,
  errorMessage: false,
  selectedBankAccount: null,
  selectedGame: null, // To track the selected game for modal
  previouslySelectedTab: null, // To track previously selected tab for navigation
  activePopups: [], // To store filtered active popups
  // Alert data
  alerts: {
    unreadNotes: [],
    pendingRequests: { deposits: [], withdrawals: [] },
    isLoading: false,
    lastChecked: null,
  },
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setWebsiteLoader: (state, action) => {
      state.websiteLoader = action.payload;
    },
    openModal: (state, action) => {
      const payload = action.payload;
      if (typeof payload === 'string') {
        state.currentModal = payload;
        state.modalProps = null;
      } else if (payload && typeof payload === 'object') {
        state.currentModal = payload.modal;
        state.modalProps = payload.props || null;
      }
    },
    closeModal: (state) => {
      state.currentModal = null; // Clear the modal key to close all modals
      state.modalProps = null;
    },
    sidebarToggle: (state) => {
      state.isSide = !state.isSide;
    },
    resetErrorState: (state) => {
      state.isError = false;
      state.errorMessage = null;
    },
    closeAllModals: (state) => {
      state.currentModal = null;
    },
    setSelectedBankAccount: (state, action) => {
      state.selectedBankAccount = action.payload;
    },
    clearSelectedBankAccount: (state) => {
      state.selectedBankAccount = null;
    },
    setSelectedGame: (state, action) => {
      state.selectedGame = action.payload;
    },
    clearSelectedGame: (state) => {
      state.selectedGame = null;
    },
    setPreviouslySelectedTab: (state, action) => {
      state.previouslySelectedTab = action.payload;
    },
    clearPreviouslySelectedTab: (state) => {
      state.previouslySelectedTab = null;
    },
    setActivePopups: (state, action) => {
      state.activePopups = action.payload;
    },
    // Alert data reducers
    setAlertsLoading: (state, action) => {
      // Ensure alerts object exists
      if (!state.alerts) {
        state.alerts = {
          unreadNotes: [],
          pendingRequests: { deposits: [], withdrawals: [] },
          isLoading: false,
          lastChecked: null,
        };
      }
      state.alerts.isLoading = action.payload;
    },
    setAlertsData: (state, action) => {
      const { unreadNotes, pendingRequests } = action.payload;
      if (!state.alerts) {
        state.alerts = {
          unreadNotes: [],
          pendingRequests: { deposits: [], withdrawals: [] },
          isLoading: false,
          lastChecked: null,
        };
      }
      state.alerts.unreadNotes = unreadNotes || [];
      state.alerts.pendingRequests = pendingRequests || {
        deposits: [],
        withdrawals: [],
      };
      state.alerts.lastChecked = new Date().toISOString();
    },
    clearAlertsData: (state) => {
      if (!state.alerts) {
        state.alerts = {
          unreadNotes: [],
          pendingRequests: { deposits: [], withdrawals: [] },
          isLoading: false,
          lastChecked: null,
        };
      }
      state.alerts.unreadNotes = [];
      state.alerts.pendingRequests = { deposits: [], withdrawals: [] };
      state.alerts.isLoading = false;
      state.alerts.lastChecked = null;
    },
  },
  extraReducers: () => {},
});

export const {
  setWebsiteLoader,
  openModal,
  closeModal,
  sidebarToggle,
  resetErrorState,
  closeAllModals,
  setSelectedBankAccount,
  clearSelectedBankAccount,
  setSelectedGame,
  clearSelectedGame,
  setPreviouslySelectedTab,
  clearPreviouslySelectedTab,
  setActivePopups,
  // Alert actions
  setAlertsLoading,
  setAlertsData,
  clearAlertsData,
} = commonSlice.actions;
export default commonSlice.reducer;
