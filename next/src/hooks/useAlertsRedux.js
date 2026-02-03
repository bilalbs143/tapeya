'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearAlertsData,
  setAlertsData,
  setAlertsLoading,
} from '@/slices/common/commonSlice';
import { fetchRequestInfo, fetchUnreadNotes } from '@/website/websiteAction';

/**
 * Hook that manages alert data using Redux store
 * Fetches data once and stores it centrally for all components to use
 */
export const useAlertsRedux = () => {
  const dispatch = useDispatch();

  // Get alert data from Redux store with fallback
  const alerts = useSelector((state) => state.common.alerts) || {
    unreadNotes: [],
    pendingRequests: { deposits: [], withdrawals: [] },
    isLoading: false,
    lastChecked: null,
  };
  const isAuth = useSelector((state) => state.auth.isAuth);

  // Calculate derived values with safe access
  const unreadCount = alerts.unreadNotes?.length || 0;
  const hasUnreadNotes = unreadCount > 0;

  const pendingDepositCount = alerts.pendingRequests?.deposits?.length || 0;
  const pendingWithdrawalCount =
    alerts.pendingRequests?.withdrawals?.length || 0;
  const totalPendingCount = pendingDepositCount + pendingWithdrawalCount;
  const hasPendingRequests = totalPendingCount > 0;

  const hasAnyAlerts = hasUnreadNotes || hasPendingRequests;
  const isLoading = alerts.isLoading || false;

  // Fetch all alert data
  const fetchAlertsData = useCallback(async () => {
    if (!isAuth) {
      return { hasUnreadNotes: false, hasPendingRequests: false };
    }

    try {
      dispatch(setAlertsLoading(true));

      const [unreadNotesResult, pendingRequestsResult] = await Promise.all([
        dispatch(fetchUnreadNotes()).unwrap(),
        dispatch(
          fetchRequestInfo({
            type: 'deposit,withdraw',
            status: 'pending',
            perPage: 50,
            page: 1,
          }),
        ).unwrap(),
      ]);

      // Process unread notes
      const allNotes = unreadNotesResult?.data || [];
      const unreadNotes = allNotes.filter((note) => !note.read_at);

      // Process pending requests
      const allRequests = pendingRequestsResult?.data || [];
      const deposits = allRequests.filter(
        (request) =>
          request.type?.toLowerCase() === 'deposit' ||
          request.type_enum === 'DEPOSIT',
      );
      const withdrawals = allRequests.filter(
        (request) =>
          request.type?.toLowerCase() === 'withdraw' ||
          request.type_enum === 'WITHDRAW',
      );

      // Store data in Redux
      dispatch(
        setAlertsData({
          unreadNotes,
          pendingRequests: { deposits, withdrawals },
        }),
      );

      const hasNotes = unreadNotes.length > 0;
      const hasRequests = deposits.length > 0 || withdrawals.length > 0;

      return { hasUnreadNotes: hasNotes, hasPendingRequests: hasRequests };
    } catch (error) {
      console.error('Failed to fetch alert data:', error);
      return { hasUnreadNotes: false, hasPendingRequests: false };
    } finally {
      dispatch(setAlertsLoading(false));
    }
  }, [dispatch, isAuth]);

  // Clear alert data
  const clearAlerts = useCallback(() => {
    dispatch(clearAlertsData());
  }, [dispatch]);

  return {
    // Data
    unreadNotes: alerts.unreadNotes || [],
    unreadCount,
    hasUnreadNotes,
    pendingRequests: alerts.pendingRequests || {
      deposits: [],
      withdrawals: [],
    },
    pendingDepositCount,
    pendingWithdrawalCount,
    totalPendingCount,
    hasPendingRequests,
    hasAnyAlerts,
    isLoading,
    lastChecked: alerts.lastChecked || null,

    // Actions
    fetchAlertsData,
    clearAlerts,
  };
};
