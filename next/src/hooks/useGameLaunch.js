'use client';

import { Capacitor } from '@capacitor/core';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useAlertsRedux } from '@/hooks/useAlertsRedux';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';
import { launchGame } from '@/website/websiteAction';

export const useGameLaunch = () => {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const [launchingGameId, setLaunchingGameId] = useState(null);

  // Get authentication state from Redux store
  const { isAuth } = useSelector((state) => state.auth);

  // Get alert data from Redux
  const { fetchAlertsData } = useAlertsRedux();

  const openUrlInCapacitor = async (url) => {
    try {
      const { Browser } = await import('@capacitor/browser');

      await Browser.open({
        url: url,
      });

      return true;
    } catch (error) {
      console.log('Error:', error);
      return false;
    }
  };

  const openUrlInBrowser = (url) => {
    try {
      const width = 1200;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const gameWindow = window.open(
        url,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
      );

      // Check if popup was blocked
      if (
        !gameWindow ||
        gameWindow.closed ||
        typeof gameWindow.closed === 'undefined'
      ) {
        throw new Error('Popup blocked');
      }

      return true;
    } catch (error) {
      console.log('Error:', error);
      window.open(url, '_blank');
      return false;
    }
  };

  const handlePlayGame = useCallback(
    async (gameId, onSuccess) => {
      if (!gameId) {
        toast.error('Game ID is required');
        return;
      }

      if (!isAuth) {
        toast.info(t('please_log_in_to_continue'));
        dispatch(openModal('login'));
        return;
      }

      try {
        const alertResult = await fetchAlertsData();

        if (alertResult.hasUnreadNotes || alertResult.hasPendingRequests) {
          dispatch(openModal('alert'));
          return;
        }
      } catch (error) {
        console.log('Error:', error);
      }

      try {
        setLaunchingGameId(gameId);
        const result = await dispatch(launchGame({ gameId }));

        if (
          result.payload &&
          result.payload.data &&
          result.payload.data.launch_url
        ) {
          const gameUrl = result.payload.data.launch_url;
          let launchSuccess = false;

          // Check if running in Capacitor (mobile app)
          if (Capacitor.isNativePlatform()) {
            launchSuccess = await openUrlInCapacitor(gameUrl);

            if (!launchSuccess) {
              // Use the system's default browser
              window.open(gameUrl, '_blank');
            }
          } else {
            // Web browser
            launchSuccess = openUrlInBrowser(gameUrl);
          }

          // Call success callback if provided
          if (onSuccess) {
            onSuccess(result.payload.data);
          }
        }
      } catch (error) {
        console.log('Error:', error);
        toast.error('Failed to launch game. Please try again.');
      } finally {
        setLaunchingGameId(null);
      }
    },
    [dispatch, isAuth, fetchAlertsData],
  );

  const isLaunching = (gameId) => launchingGameId === gameId;

  return {
    handlePlayGame,
    isLaunching,
    launchingGameId,
  };
};
