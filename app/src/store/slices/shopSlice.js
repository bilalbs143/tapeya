import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /** Cart drawer / sidebar open (e.g. for mobile) */
  cartOpen: false,
  /** Checkout flow step (0 = billing, 1 = payment, etc.) */
  checkoutStep: 0,
  /** Last selected filters (client-side before applying to API) */
  filters: {
    brandId: null,
    categoryId: null,
    search: '',
  },
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setCartOpen: (state, action) => {
      state.cartOpen = action.payload ?? !state.cartOpen;
    },
    setCheckoutStep: (state, action) => {
      state.checkoutStep = action.payload ?? 0;
    },
    setShopFilters: (state, action) => {
      const { brandId, categoryId, search } = action.payload ?? {};
      if (brandId !== undefined) state.filters.brandId = brandId;
      if (categoryId !== undefined) state.filters.categoryId = categoryId;
      if (search !== undefined) state.filters.search = search;
    },
    resetShopFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetShopCheckout: (state) => {
      state.checkoutStep = 0;
    },
  },
});

export const {
  setCartOpen,
  setCheckoutStep,
  setShopFilters,
  resetShopFilters,
  resetShopCheckout,
} = shopSlice.actions;

export default shopSlice.reducer;
