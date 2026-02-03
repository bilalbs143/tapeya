import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axiosInstance';

import { closeAllModals } from '../common/commonSlice';
import { setClearAuth } from './authSlice';

// Authentication Actions
export const loginUser = createAsyncThunk('auth/login', async (payload) => {
  const response = await axiosInstance.post('/auth/login', payload);

  if (response.data?.message) {
    toast.success(response.data.message);
  }

  return response.data;
});

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload) => {
    const response = await axiosInstance.post('/auth/register', payload);

    if (response.data?.message) {
      toast.success(response.data.message);
    }

    return response.data;
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    const response = await axiosInstance.post('/auth/logout');

    if (response.data?.message) {
      toast.success(response.data.message);
    }

    dispatch(closeAllModals());
    dispatch(setClearAuth());
    return response.data;
  },
);

export const fetchUserProfile = createAsyncThunk(
  'auth/profile/me',
  async (payload) => {
    const response = await axiosInstance.get('/auth/profile/me', payload);

    if (response.data?.message) {
      toast.success(response.data.message);
    }

    return response.data;
  },
);

export const updateUserProfile = createAsyncThunk(
  'auth/profile',
  async (payload) => {
    const response = await axiosInstance.patch('/auth/profile', payload);

    if (response.data?.message) {
      toast.success(response.data.message);
    }

    return response.data;
  },
);

// Password Management
export const updateUserPassword = createAsyncThunk(
  'auth/profile/password',
  async (payload) => {
    const response = await axiosInstance.patch(
      '/auth/profile/password',
      payload,
    );

    if (response.data?.message) {
      toast.success(response.data.message);
    }

    return response.data;
  },
);
