'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setActivePopups } from '@/slices/common/commonSlice';
import { fetchPopupData } from '@/website/websiteAction';

export const usePopupData = () => {
  const dispatch = useDispatch();
  const { popupDataLoader, popupDataData } = useSelector(
    (state) => state.website,
  );

  // Tick to refresh memoized filtering when localStorage-based flags change
  const [refreshTick, setRefreshTick] = useState(0);

  // Fetch popup data when hook is used
  useEffect(() => {
    dispatch(fetchPopupData());
  }, [dispatch]);

  // Filter active popups that are not hidden for 24 hours
  const activePopups = useMemo(() => {
    if (!popupDataData || !Array.isArray(popupDataData)) {
      return [];
    }

    return popupDataData.filter((popup) => {
      if (!popup.is_active) return false;

      // Check if popup should be hidden for 24 hours
      const hideUntil = localStorage.getItem(`popup_hide_${popup.id}`);
      if (hideUntil) {
        const hideUntilTime = parseInt(hideUntil, 10);
        if (Date.now() < hideUntilTime) return false;
      }

      return true;
    });
  }, [popupDataData, refreshTick]);

  // Listen to localStorage updates and custom events to refresh popups immediately
  useEffect(() => {
    const handleStorage = (e) => {
      if (e && e.key && e.key.startsWith('popup_hide_')) {
        setRefreshTick((t) => t + 1);
      }
    };

    const handleCustom = () => setRefreshTick((t) => t + 1);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('popup:hide-updated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('popup:hide-updated', handleCustom);
    };
  }, []);

  // Store active popups in Redux when they change
  useEffect(() => {
    dispatch(setActivePopups(activePopups));
  }, [activePopups, dispatch]);

  // Check if there are any active popups to show
  const hasActivePopups = activePopups.length > 0;

  return {
    popupDataLoader,
    popupDataData,
    activePopups,
    hasActivePopups,
  };
};
