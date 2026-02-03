import { combineReducers } from '@reduxjs/toolkit';

import { baseApi } from '@/store/api/baseApi';
import authReducer from '@/store/slices/authSlice';
import commonReducer from '@/store/slices/commonSlice';
import uiReducer from '@/store/slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  common: commonReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
