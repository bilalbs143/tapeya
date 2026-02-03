import Pusher from 'pusher-js';

import { API_BASE_URL, PUSHER_CLUSTER, PUSHER_KEY } from '@/config/environment';

let pusher = null;
let currentToken = null;

export const getPusher = () => {
  if (typeof window === 'undefined') return null;

  // Get the current JWT token from localStorage
  const token = localStorage.getItem('jwt');

  // If token changed or pusher doesn't exist, recreate it
  if (!pusher || currentToken !== token) {
    // Disconnect existing pusher if it exists
    if (pusher) {
      pusher.disconnect();
    }

    currentToken = token;

    pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
      authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      },
    });
  }

  return pusher;
};

export const PUSHER_CHANNELS = {
  USER: 'App.Models.User',
  GLOBAL: 'global-announcements',
};

export const PUSHER_EVENTS = {
  WALLET_UPDATE: 'App\\Events\\General\\User\\UserWalletUpdated',

  // Exchange Request Events
  EXCHANGE_REQUEST_REJECTED:
    'App\\Events\\Admin\\ExchangeRequest\\ExchangeRequestRejected',
  EXCHANGE_REQUEST_APPROVED:
    'App\\Events\\Admin\\ExchangeRequest\\ExchangeRequestApproved',

  // Admin Events
  ANNOUNCEMENT_CREATED: 'App\\Events\\Admin\\Announcement\\AnnouncementCreated',
  NOTE_CREATED: 'App\\Events\\Admin\\Note\\NoteCreated',

  // Customer Service Events
  CUSTOMER_INQUIRY_REPLIED:
    'App\\Events\\Admin\\CustomerInquiry\\CustomerInquiryReplied',
};
