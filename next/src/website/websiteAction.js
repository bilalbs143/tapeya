'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import axiosInstance from '@/lib/axiosInstance';
import { fetchUserProfile } from '@/slices/auth/authAction';

export const fetchAllFaqs = createAsyncThunk('user/faqs', async (payload) => {
  const response = await axiosInstance.get('/user/faqs?all', payload);
  return response.data;
});

export const fetchAllAnnouncements = createAsyncThunk(
  'user/announcements',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/announcements?all&sort=-created_at',
      payload,
    );
    return response.data;
  },
);

export const fetchImportantAnnouncements = createAsyncThunk(
  'user/announcements/important',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/announcements/important?sort=-created_at',
      payload,
    );
    return response.data;
  },
);

export const fetchPromotions = createAsyncThunk(
  'user/promotions',
  async (payload) => {
    const response = await axiosInstance.get('/user/promotions', payload);
    return response.data;
  },
);

export const fetchUserPromotionProgress = createAsyncThunk(
  'user/promotion-progress',
  async (payload) => {
    const response = await axiosInstance.get('/user/promotion-progress', {
      params: payload,
    });
    return response.data;
  },
);

export const activatePromotion = createAsyncThunk(
  'user/promotions/activate',
  async (payload, { rejectWithValue }) => {
    try {
      const { promotionId } = payload;
      const response = await axiosInstance.post(
        `/user/promotions/${promotionId}/activate`,
      );
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        'Failed to activate promotion';
      return rejectWithValue(message);
    }
  },
);

export const claimPromotion = createAsyncThunk(
  'user/promotions/claim',
  async (payload, { rejectWithValue }) => {
    try {
      const { promotionId } = payload;
      const response = await axiosInstance.post(
        `/user/promotions/${promotionId}/redeem`,
      );
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        'Failed to claim promotion';
      return rejectWithValue(message);
    }
  },
);

export const fetchUserNotes = createAsyncThunk(
  'website/notes/fetch',
  async (payload) => {
    const { perPage, page } = payload;
    const response = await axiosInstance.get(
      `/user/note/users?perPage=${perPage}&page=${page}`,
    );
    return response.data;
  },
);

export const fetchUnreadNotes = createAsyncThunk(
  'website/notes/unread',
  async (payload) => {
    const response = await axiosInstance.get('/user/note/users', payload);
    return response.data;
  },
);

export const fetchUserMessages = createAsyncThunk(
  'website/messages/fetch',
  async (payload) => {
    const { id } = payload;
    const response = await axiosInstance.get(`/user/note/users/${id}`);
    return response.data;
  },
);

export const fetchPopupData = createAsyncThunk(
  'user/popups/all',
  async (payload) => {
    const response = await axiosInstance.get('/user/popups?all', payload);
    return response.data;
  },
);

export const fetchAllGames = createAsyncThunk('user/games', async (payload) => {
  const { page = 1, perPage = 20, filter = {} } = payload || {};

  let queryParams = `page=${page}&perPage=${perPage}`;

  if (filter && Object.keys(filter).length > 0) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams += `&filter[${key}]=${value}`;
      }
    });
  }

  const response = await axiosInstance.get(`/user/games?${queryParams}`);
  return response.data;
});

export const fetchAllGamesWithoutPagination = createAsyncThunk(
  'user/games/all',
  async () => {
    const response = await axiosInstance.get('/user/games?all');
    return response.data;
  },
);

export const fetchGameLobby = createAsyncThunk(
  'user/games/lobby',
  async (payload) => {
    const response = await axiosInstance.get('/user/games/lobby', payload);
    return response.data;
  },
);

export const launchGame = createAsyncThunk(
  'user/games/launch',
  async (payload) => {
    const { gameId } = payload;
    const response = await axiosInstance.get(`/user/games/${gameId}/launch`);
    return response.data;
  },
);

export const fetchSystemSettings = createAsyncThunk(
  'user/system-settings/bank_info_for_quick_inquiry',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/system-settings/bank_info_for_quick_inquiry',
      payload,
    );
    return response.data;
  },
);

export const fetchLiveChatHtmlCode = createAsyncThunk(
  'user/system-settings/live_chat_html_code',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/system-settings/live_chat_html_code',
      payload,
    );
    return response.data;
  },
);

export const fetchTrackingHtmlCode = createAsyncThunk(
  'user/system-settings/tracking_html_code',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/system-settings/tracking_html_code',
      payload,
    );
    return response.data;
  },
);

export const fetchBettingHistory = createAsyncThunk(
  'user/transactions/bets/history',
  async (payload = {}) => {
    const {
      perPage = 10,
      page = 1,
      sort = '-created_at',
      filter = {},
    } = payload;

    const params = {
      perPage,
      page,
      sort,
      ...filter,
    };

    const response = await axiosInstance.get(
      '/user/transactions/bets/history',
      { params },
    );
    return response.data;
  },
);

export const fetchBettingData = createAsyncThunk(
  'user/transactions/bets/data',
  async (payload) => {
    const response = await axiosInstance.post(
      '/user/transactions/bets/history',
      payload,
    );
    return response.data;
  },
);

export const fetchRealtimeWinners = createAsyncThunk(
  'user/transactions/real-time/winners',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/transactions/real-time/winners',
      payload,
    );
    return response.data;
  },
);

export const fetchRealtimeDeposits = createAsyncThunk(
  'user/transactions/real-time/deposits',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/transactions/real-time/deposits',
      payload,
    );
    return response.data;
  },
);

export const fetchRealtimeWithdrawals = createAsyncThunk(
  'user/transactions/real-time/withdrawals',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/transactions/real-time/withdrawals',
      payload,
    );
    return response.data;
  },
);

export const createTransactionRequest = createAsyncThunk(
  'user/transactions/requests',
  async (payload, { dispatch }) => {
    const response = await axiosInstance.post(
      '/user/transactions/requests',
      payload,
    );

    if (response.data) {
      dispatch(fetchUserProfile());
    }

    return response.data;
  },
);

export const fetchTransactionHistory = createAsyncThunk(
  'user/transactions',
  async (payload) => {
    const {
      subType,
      perPage,
      page,
      sort,
      category,
      source,
      extraFilters = {},
    } = payload;

    const params = {
      perPage,
      page,
      sort,
      'filter[sub_type]': subType,
      ...(category ? { 'filter[category]': category } : {}),
      ...(source ? { 'filter[source]': source } : {}),
      ...extraFilters,
    };

    const response = await axiosInstance.get('/user/transactions', {
      params,
    });
    return response.data;
  },
);

export const fetchAllBanks = createAsyncThunk(
  'user/banksall',
  async (payload) => {
    const response = await axiosInstance.get('/user/banks?all', payload);
    return response.data;
  },
);

export const fetchRequestInfo = createAsyncThunk(
  'user/transactions/requests/info',
  async (payload) => {
    const { type, perPage = 50, page = 1, status } = payload;

    let queryParams = `perPage=${perPage}&page=${page}`;

    if (type) {
      queryParams += `&filter[type]=${type}`;
    }

    if (status) {
      queryParams += `&filter[status]=${status}`;
    }

    const response = await axiosInstance.get(
      `/user/transactions/requests?${queryParams}`,
    );
    return response.data;
  },
);

export const createQuickAccountInquiry = createAsyncThunk(
  'user/quick-account-inquiries',
  async (payload) => {
    const response = await axiosInstance.post(
      '/user/quick-account-inquiries',
      payload,
    );
    return response.data;
  },
);

export const fetchCustomerInquiryCategories = createAsyncThunk(
  'user/customer-inquiries/categories',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/customer-inquiries/categories',
      payload,
    );
    return response.data;
  },
);

export const createCustomerInquiry = createAsyncThunk(
  'user/customer-inquiries',
  async (payload) => {
    const response = await axiosInstance.post(
      '/user/customer-inquiries',
      payload,
    );
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response.data;
  },
);

export const fetchAllCustomerInquiries = createAsyncThunk(
  'user/customer-inquiries/all',
  async (payload) => {
    const { perPage, page } = payload;
    const response = await axiosInstance.get(
      `/user/customer-inquiries?perPage=${perPage}&page=${page}`,
    );
    return response.data;
  },
);

export const deleteCustomerInquiry = createAsyncThunk(
  'user/customer-inquiries/delete',
  async (payload) => {
    const { id } = payload;
    const response = await axiosInstance.delete(
      `/user/customer-inquiries/${id}`,
    );
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response.data;
  },
);

export const fetchCustomerInquiry = createAsyncThunk(
  'user/customer-inquiries/single',
  async (payload) => {
    const { id } = payload;
    const response = await axiosInstance.get(`/user/customer-inquiries/${id}`);
    return response.data;
  },
);

export const fetchBankAccounts = createAsyncThunk(
  'user/bank-accounts',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/bank-accounts?all',
      payload,
    );
    return response.data;
  },
);

export const fetchAllProvider = createAsyncThunk(
  'user/providers',
  async (payload) => {
    const response = await axiosInstance.get('/user/providers?all', payload);
    return response.data;
  },
);

export const fetchUserReferrals = createAsyncThunk(
  'user/referrals',
  async (payload) => {
    const { perPage = 10, page = 1 } = payload || {};

    let queryParams = `perPage=${perPage}&page=${page}`;
    queryParams += '&filter[sub_type]=points';
    queryParams += '&filter[category]=referral_bonus_points';

    const response = await axiosInstance.get(
      `/user/transactions?${queryParams}`,
    );
    return response.data;
  },
);

export const fetchCurrencies = createAsyncThunk(
  'user/payments/currencies',
  async (payload) => {
    const response = await axiosInstance.get(
      '/user/payments/currencies',
      payload,
    );
    return response.data;
  },
);

// Crypto Payment Actions
export const createCryptoPayment = createAsyncThunk(
  'user/payments/crypto',
  async (payload) => {
    const response = await axiosInstance.post(
      '/user/payments/deposit',
      payload,
    );
    return response.data;
  },
);

export const getCryptoPaymentStatus = createAsyncThunk(
  'user/payments/status',
  async (paymentId) => {
    try {
      const response = await axiosInstance.get(
        `/user/payments/status?payment_id=${paymentId}`,
        { metadata: { silent: true } },
      );
      return response.data;
    } catch (error) {
      console.log('Payment status polling failed (silent):', error);
    }
  },
);

export const createCryptoWithdrawal = createAsyncThunk(
  'user/payments/crypto-withdrawal',
  async (payload) => {
    const response = await axiosInstance.post(
      '/user/payments/crypto-withdrawal',
      payload,
    );
    return response.data;
  },
);

export const verifyCryptoAddress = createAsyncThunk(
  'user/payments/verify-crypto-address',
  async (payload) => {
    const response = await axiosInstance.post(
      '/user/payments/verify-crypto-address',
      payload,
    );
    return response.data;
  },
);

export const getEstimatedExchangeRate = createAsyncThunk(
  'user/payments/estimated-exchange-rate',
  async (payload) => {
    const { amount, currency_from, currency_to, is_withdrawal } = payload;
    const response = await axiosInstance.get(
      `/user/payments/estimated-exchange-rate?amount=${amount}&currency_from=${currency_from}&currency_to=${currency_to}&is_withdrawal=${is_withdrawal}`,
    );
    return response.data;
  },
);

export const getMinimumDepositAmount = createAsyncThunk(
  'user/payments/minimum-deposit-amount',
  async (currency, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/user/payments/minimum-deposit-amount?currency_from=${currency}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch minimum deposit amount:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch minimum deposit amount',
      );
    }
  },
);

export const getMinimumWithdrawalAmount = createAsyncThunk(
  'user/payments/minimum-withdrawal-amount',
  async (currency, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/user/payments/minimum-withdrawal-amount?currency=${currency}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch minimum withdrawal amount:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch minimum withdrawal amount',
      );
    }
  },
);

export const checkPendingDeposits = createAsyncThunk(
  'user/payments/pending-deposits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        '/user/payments/pending-deposits',
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check pending deposits:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check pending deposits',
      );
    }
  },
);

export const cancelCryptoDeposit = createAsyncThunk(
  'user/payments/cancel-deposit',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/user/payments/cancel-deposit',
        payload,
      );

      if (response.data?.data?.success) {
        toast.success(
          response.data.data.message || 'Deposit cancelled successfully',
        );
        // Refresh user profile after cancellation
        dispatch(fetchUserProfile());
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to cancel deposit';
      toast.error(errorMessage);
      console.error('Failed to cancel deposit:', error);
      return rejectWithValue(errorMessage);
    }
  },
);
