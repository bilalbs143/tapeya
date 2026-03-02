import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /** User-published reels. API-ready: replace with async thunk that POSTs to backend. */
  publishedReels: [],
};

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    addReel: (state, action) => {
      const reel = action.payload;
      state.publishedReels.unshift({
        id: reel.id ?? `published-${Date.now()}`,
        videoUrl: reel.videoUrl,
        username: reel.username ?? 'Oneeb Arif',
        handle: reel.handle ?? '@oneeb',
        caption: reel.caption ?? '',
        likes: reel.likes ?? 0,
      });
    },
    removeReel: (state, action) => {
      const id = action.payload;
      state.publishedReels = state.publishedReels.filter((r) => r.id !== id);
    },
    /** API-ready: clear local list when syncing from server */
    setPublishedReels: (state, action) => {
      state.publishedReels = action.payload ?? [];
    },
  },
});

export const { addReel, removeReel, setPublishedReels } = reelsSlice.actions;
export default reelsSlice.reducer;
