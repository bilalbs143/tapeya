import { combineReducers } from '@reduxjs/toolkit';

import { baseApi } from '@/store/api/baseApi';
import authReducer from '@/store/slices/authSlice';
import commonReducer from '@/store/slices/commonSlice';
import reelsReducer from '@/store/slices/reelsSlice';
import shopReducer from '@/store/slices/shopSlice';
import uiReducer from '@/store/slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  common: commonReducer,
  reels: reelsReducer,
  shop: shopReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
