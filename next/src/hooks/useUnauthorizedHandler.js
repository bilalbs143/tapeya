'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setUnauthorizedHandler } from '@/lib/axiosInstance';
import { setClearAuth } from '@/slices/auth/authSlice';
import { closeAllModals } from '@/slices/common/commonSlice';

export const useUnauthorizedHandler = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentModal = useSelector((state) => state.common.currentModal);

  useEffect(() => {
    // Set up the unauthorized handler with proper Next.js routing
    setUnauthorizedHandler(() => {
      const isAuthModal =
        currentModal === 'login' || currentModal === 'register';

      if (!isAuthModal) {
        dispatch(closeAllModals());
        dispatch(setClearAuth());
        router.push('/');
      }
    });

    // Cleanup function to reset the handler when component unmounts
    return () => {
      setUnauthorizedHandler(() => {
        console.log('Unauthorized handler not set');
      });
    };
  }, [router, dispatch, currentModal]);
};
