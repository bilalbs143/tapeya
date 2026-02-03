import { create } from 'zustand';

/**
 * Global app store - add slices as your app grows
 * Consider splitting: useAuthStore, useUserStore, etc.
 */
export const useAppStore = create((set) => ({
  // Example state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
