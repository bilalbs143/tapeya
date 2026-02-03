'use client';

import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axiosInstance';
import {
  setError,
  setLoading,
  setPayload,
} from '@/slices/request/requestSlice';

export const useRequest = () => {
  const dispatch = useDispatch();

  const request = async (config, options = {}) => {
    const {
      showError = true,
      successMessage = '',
      errorMessage = '', // Custom error message
    } = options;

    try {
      // Start loading globally
      dispatch(setLoading(true));
      dispatch(setError(null)); // Clear previous errors

      const response = await axiosInstance(config);

      // Dispatch the payload to Redux store
      dispatch(setPayload(response.data));

      // Show success toast if applicable
      if (successMessage) {
        toast.success(successMessage);
      }
      return response.data;
    } catch (err) {
      console.log('err in request', err);
      const backendErrorMessage =
        errorMessage || err.response?.data?.message || 'An error occurred!';
      dispatch(setError(backendErrorMessage)); // Set error in Redux
      // toast.err("test error....")
      // Show error toast if enabled
      if (showError) {
        toast.error(backendErrorMessage);
      }

      return Promise.reject(new Error(backendErrorMessage));
    } finally {
      // Stop loading globally
      dispatch(setLoading(false));
    }
  };

  return { request };
};
