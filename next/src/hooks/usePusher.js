import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useAlertsRedux } from '@/hooks/useAlertsRedux';
import { useTemplate } from '@/hooks/useTemplate';
import { getPusher, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher';
import { useAudioNotification } from '@/providers/AudioNotificationProvider';
import { updateUserWallet } from '@/slices/auth/authSlice';
import { openModal } from '@/slices/common/commonSlice';
import { fetchUnreadNotes } from '@/website/websiteAction';

export const usePusher = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const userId = useSelector((state) => state.auth.user?.id);
  const pusherRef = useRef(null);
  const { fetchAlertsData } = useAlertsRedux();
  const { play } = useAudioNotification();
  const { notificationSounds } = useTemplate();

  useEffect(() => {
    if (!isAuth || !userId) {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      return;
    }

    const pusher = getPusher();
    if (!pusher) return;

    pusherRef.current = pusher;

    // Subscribe to user channel with error handling
    const userChannel = pusher.subscribe(
      `private-${PUSHER_CHANNELS.USER}.${userId}`,
    );

    userChannel.bind('pusher:subscription_error', (error) => {
      console.error('Pusher subscription failed:', error);
    });

    const handleExchangeRequestApproved = (data) => {
      play(notificationSounds.exchange_approved);
      dispatch(fetchUnreadNotes());

      // Show alert modal with approval message
      dispatch(
        openModal({
          modal: 'alert',
          props: {
            type: 'exchange_approved',
            data: data,
          },
        }),
      );
    };

    const handleExchangeRequestRejected = (data) => {
      play(notificationSounds.exchange_rejected);
      dispatch(fetchUnreadNotes());

      // Show alert modal with rejection message
      dispatch(
        openModal({
          modal: 'alert',
          props: {
            type: 'exchange_rejected',
            data: data,
          },
        }),
      );
    };

    const handleCustomerInquiryReplied = async (data) => {
      play(notificationSounds.inquiry_replied);
      dispatch(fetchUnreadNotes());

      try {
        const alertResult = await fetchAlertsData();

        // If there are unread notes, show the alert modal instead of the inquiry reply notification
        if (alertResult.hasUnreadNotes) {
          dispatch(openModal('alert'));
          return;
        }

        // If no unread notes, show the customer inquiry reply notification
        dispatch(
          openModal({
            modal: 'alert',
            props: {
              type: 'customer_inquiry_replied',
              data: data,
            },
          }),
        );
      } catch (error) {
        console.error('Failed to check alerts:', error);

        // Fallback: show the customer inquiry reply notification
        dispatch(
          openModal({
            modal: 'alert',
            props: {
              type: 'customer_inquiry_replied',
              data: data,
            },
          }),
        );
      }
    };

    const handleNoteCreated = async () => {
      play(notificationSounds.note_created);
      dispatch(fetchUnreadNotes());

      try {
        const alertResult = await fetchAlertsData();

        // If there are unread notes, show the alert modal
        if (alertResult.hasUnreadNotes) {
          dispatch(openModal('alert'));
          return;
        }
      } catch (error) {
        console.error('Failed to check alerts:', error);
      }
    };

    const walletRefresh = (data) => {
      if (data?.wallet) {
        dispatch(updateUserWallet(data.wallet));
      }
    };

    // Bind all events using variables from PUSHER_EVENTS
    userChannel.bind(
      PUSHER_EVENTS.EXCHANGE_REQUEST_REJECTED,
      handleExchangeRequestRejected,
    );
    userChannel.bind(
      PUSHER_EVENTS.EXCHANGE_REQUEST_APPROVED,
      handleExchangeRequestApproved,
    );
    userChannel.bind(PUSHER_EVENTS.ANNOUNCEMENT_CREATED, () => {
      play(notificationSounds.announcement);
      dispatch(openModal('announcement'));
    });
    userChannel.bind(PUSHER_EVENTS.NOTE_CREATED, handleNoteCreated);
    userChannel.bind(
      PUSHER_EVENTS.CUSTOMER_INQUIRY_REPLIED,
      handleCustomerInquiryReplied,
    );
    userChannel.bind(PUSHER_EVENTS.WALLET_UPDATE, walletRefresh);

    // Subscribe to global channel
    const globalChannel = pusher.subscribe(PUSHER_CHANNELS.GLOBAL);
    globalChannel.bind(PUSHER_EVENTS.ANNOUNCEMENT_CREATED, () => {
      // Global announcement handling if needed
    });

    return () => {
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [isAuth, userId, dispatch, fetchAlertsData]);

  return {
    isConnected: !!pusherRef.current,
  };
};
