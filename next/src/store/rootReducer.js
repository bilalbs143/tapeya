'use client';

import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@/slices/auth/authSlice';
import commonReducer from '@/slices/common/commonSlice';
import requestReducer from '@/slices/request/requestSlice';
import themeReducer from '@/slices/theme/themeSlice';
import websiteReducer from '@/website/websiteSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  common: commonReducer,
  website: websiteReducer,
  auth: authReducer,
  request: requestReducer,
});

export default rootReducer;
