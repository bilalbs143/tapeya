import { createSlice } from '@reduxjs/toolkit';

import {
  activatePromotion,
  cancelCryptoDeposit,
  checkPendingDeposits,
  claimPromotion,
  createCryptoPayment,
  createCryptoWithdrawal,
  createCustomerInquiry,
  createQuickAccountInquiry,
  createTransactionRequest,
  deleteCustomerInquiry,
  fetchAllAnnouncements,
  fetchAllBanks,
  fetchAllCustomerInquiries,
  fetchAllFaqs,
  fetchAllGames,
  fetchAllGamesWithoutPagination,
  fetchAllProvider,
  fetchBankAccounts,
  fetchBettingData,
  fetchBettingHistory,
  fetchCurrencies,
  fetchCustomerInquiry,
  fetchCustomerInquiryCategories,
  fetchGameLobby,
  fetchImportantAnnouncements,
  fetchLiveChatHtmlCode,
  fetchPopupData,
  fetchPromotions,
  fetchRealtimeDeposits,
  fetchRealtimeWinners,
  fetchRealtimeWithdrawals,
  fetchRequestInfo,
  fetchSystemSettings,
  fetchTrackingHtmlCode,
  fetchTransactionHistory,
  fetchUnreadNotes,
  fetchUserMessages,
  fetchUserNotes,
  fetchUserPromotionProgress,
  fetchUserReferrals,
  getCryptoPaymentStatus,
  getEstimatedExchangeRate,
  getMinimumDepositAmount,
  getMinimumWithdrawalAmount,
  launchGame,
  verifyCryptoAddress,
} from './websiteAction';

const initialState = {
  // FAQs states
  allFaqsLoader: false,
  allFaqsData: [],

  // Announcements states
  allAnnouncementsLoader: false,
  allAnnouncementsData: [],
  importantAnnouncementsLoader: false,
  importantAnnouncementsData: [],

  // Notes states
  userNotesLoader: false,
  userNotesData: [],
  unreadNotesLoader: false,
  unreadNotesData: [],

  // Messages states
  userMessagesLoader: false,
  userMessagesData: [],

  // Popup states
  popupDataLoader: false,
  popupDataData: null,

  // Games states
  allGamesLoader: false,
  allGamesData: [],
  allGamesWithoutPaginationLoader: false,
  allGamesWithoutPaginationData: [],
  gameLobbyLoader: false,
  gameLobbyData: null,
  launchGameLoader: false,
  launchGameData: null,

  // System settings states
  systemSettingsLoader: false,
  systemSettingsData: null,

  // Betting states
  bettingHistoryLoader: false,
  bettingHistoryData: null,
  bettingDataLoader: false,
  bettingDataData: null,

  // Transaction states
  realtimeWinnersLoader: false,
  realtimeWinnersData: [],
  realtimeDepositsLoader: false,
  realtimeDepositsData: [],
  realtimeWithdrawalsLoader: false,
  realtimeWithdrawalsData: [],
  transactionRequestLoader: false,
  transactionRequestData: null,
  transactionHistoryLoader: false,
  transactionHistoryData: null,
  requestInfoLoader: false,
  requestInfoData: null,

  // Banks states
  allBanksLoader: false,
  allBanksData: [],

  // Bank Accounts states
  bankAccountsLoader: false,
  bankAccountsData: [],

  // Providers states
  allProvidersLoader: false,
  allProvidersData: [],

  // Referrals states
  referralsLoader: false,
  referralsData: null,

  // Games filter states
  selectedProviderId: null,

  // Quick account inquiry states
  quickAccountInquiryLoader: false,
  quickAccountInquiryData: null,

  // Customer inquiry states
  customerInquiryCategoriesLoader: false,
  customerInquiryCategoriesData: [],
  createCustomerInquiryLoader: false,
  createCustomerInquiryData: null,
  allCustomerInquiriesLoader: false,
  allCustomerInquiriesData: null,
  deleteCustomerInquiryLoader: false,
  deleteCustomerInquiryData: null,
  customerInquiryLoader: false,
  customerInquiryData: null,

  // Currencies states
  currenciesLoader: false,
  currenciesData: {
    coins: [],
    stablecoins: [],
    tokens: [],
    allCurrencies: [],
  },

  // Crypto Payment states
  cryptoPaymentLoader: false,
  cryptoPaymentData: null,
  cryptoPaymentStatusLoader: false,
  cryptoPaymentStatusData: null,
  cancelCryptoDepositLoader: false,
  cancelCryptoDepositData: null,
  pendingDepositsLoader: false,
  pendingDepositsData: null,

  // Crypto Withdrawal states
  cryptoWithdrawalLoader: false,
  cryptoWithdrawalData: null,

  // Address Verification states
  addressVerificationLoader: false,
  addressVerificationData: null,

  // Exchange Rate states
  exchangeRateLoader: false,
  exchangeRateData: null,

  // Minimum Deposit Amount states
  minimumDepositAmountLoader: false,
  minimumDepositAmountData: null,

  // Minimum Withdrawal Amount states
  minimumWithdrawalAmountLoader: false,
  minimumWithdrawalAmountData: null,

  // Promotions
  promotionsLoader: false,
  promotionsData: [],
  promotionProgressLoader: false,
  promotionProgressData: [],
  activatePromotionLoader: false,
  claimPromotionLoader: false,

  // Live Chat HTML Code
  liveChatHtmlCodeLoader: false,
  liveChatHtmlCodeData: null,

  // Tracking HTML Code
  trackingHtmlCodeLoader: false,
  trackingHtmlCodeData: null,
};

const websiteSlice = createSlice({
  name: 'website',
  initialState,
  reducers: {
    setSelectedProviderId: (state, action) => {
      state.selectedProviderId = action.payload;
      state.allGamesData = [];
    },
    clearCryptoWithdrawalData: (state) => {
      state.cryptoWithdrawalData = null;
    },
    clearMinimumDepositAmountData: (state) => {
      state.minimumDepositAmountData = null;
    },
    clearMinimumWithdrawalAmountData: (state) => {
      state.minimumWithdrawalAmountData = null;
    },
  },
  extraReducers: (builder) => {
    // FAQs
    builder.addCase(fetchAllFaqs.pending, (state) => {
      state.allFaqsLoader = true;
    });
    builder.addCase(fetchAllFaqs.fulfilled, (state, action) => {
      state.allFaqsLoader = false;
      state.allFaqsData = action.payload?.data || [];
    });
    builder.addCase(fetchAllFaqs.rejected, (state) => {
      state.allFaqsLoader = false;
      state.allFaqsData = [];
    });

    // Announcements
    builder.addCase(fetchAllAnnouncements.pending, (state) => {
      state.allAnnouncementsLoader = true;
    });
    builder.addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
      state.allAnnouncementsLoader = false;
      state.allAnnouncementsData = action.payload?.data || [];
    });
    builder.addCase(fetchAllAnnouncements.rejected, (state) => {
      state.allAnnouncementsLoader = false;
      state.allAnnouncementsData = [];
    });

    // Important Announcements
    builder.addCase(fetchImportantAnnouncements.pending, (state) => {
      state.importantAnnouncementsLoader = true;
    });
    builder.addCase(fetchImportantAnnouncements.fulfilled, (state, action) => {
      state.importantAnnouncementsLoader = false;
      state.importantAnnouncementsData = action.payload?.data || [];
    });
    builder.addCase(fetchImportantAnnouncements.rejected, (state) => {
      state.importantAnnouncementsLoader = false;
      state.importantAnnouncementsData = [];
    });

    // Notes
    builder.addCase(fetchUserNotes.pending, (state) => {
      state.userNotesLoader = true;
    });
    builder.addCase(fetchUserNotes.fulfilled, (state, action) => {
      state.userNotesLoader = false;
      state.userNotesData = action.payload || null;
    });
    builder.addCase(fetchUserNotes.rejected, (state) => {
      state.userNotesLoader = false;
      state.userNotesData = [];
    });

    // Update User Notes Data (for marking as read)
    builder.addCase('website/updateUserNotesData', (state, action) => {
      state.userNotesData = action.payload;
    });

    // Unread Notes
    builder.addCase(fetchUnreadNotes.pending, (state) => {
      state.unreadNotesLoader = true;
    });
    builder.addCase(fetchUnreadNotes.fulfilled, (state, action) => {
      state.unreadNotesLoader = false;
      state.unreadNotesData = action.payload?.data || [];
    });
    builder.addCase(fetchUnreadNotes.rejected, (state) => {
      state.unreadNotesLoader = false;
      state.unreadNotesData = [];
    });

    // Messages
    builder.addCase(fetchUserMessages.pending, (state) => {
      state.userMessagesLoader = true;
    });
    builder.addCase(fetchUserMessages.fulfilled, (state, action) => {
      state.userMessagesLoader = false;
      state.userMessagesData = action.payload?.data || [];
    });
    builder.addCase(fetchUserMessages.rejected, (state) => {
      state.userMessagesLoader = false;
      state.userMessagesData = [];
    });

    // Popup Data
    builder.addCase(fetchPopupData.pending, (state) => {
      state.popupDataLoader = true;
    });
    builder.addCase(fetchPopupData.fulfilled, (state, action) => {
      state.popupDataLoader = false;
      state.popupDataData = action.payload?.data || null;
    });
    builder.addCase(fetchPopupData.rejected, (state) => {
      state.popupDataLoader = false;
      state.popupDataData = null;
    });

    // Games
    builder.addCase(fetchAllGames.pending, (state) => {
      state.allGamesLoader = true;
    });
    builder.addCase(fetchAllGames.fulfilled, (state, action) => {
      state.allGamesLoader = false;
      // Store the complete payload including metadata
      if (action.payload) {
        state.allGamesData = action.payload;
      }
    });
    builder.addCase(fetchAllGames.rejected, (state) => {
      state.allGamesLoader = false;
      state.allGamesData = [];
    });

    // All Games Without Pagination
    builder.addCase(fetchAllGamesWithoutPagination.pending, (state) => {
      state.allGamesWithoutPaginationLoader = true;
    });
    builder.addCase(
      fetchAllGamesWithoutPagination.fulfilled,
      (state, action) => {
        state.allGamesWithoutPaginationLoader = false;
        state.allGamesWithoutPaginationData = action.payload?.data || [];
      },
    );
    builder.addCase(fetchAllGamesWithoutPagination.rejected, (state) => {
      state.allGamesWithoutPaginationLoader = false;
      state.allGamesWithoutPaginationData = [];
    });

    // Game Lobby
    builder.addCase(fetchGameLobby.pending, (state) => {
      state.gameLobbyLoader = true;
    });
    builder.addCase(fetchGameLobby.fulfilled, (state, action) => {
      state.gameLobbyLoader = false;
      state.gameLobbyData = action.payload?.data || null;
    });
    builder.addCase(fetchGameLobby.rejected, (state) => {
      state.gameLobbyLoader = false;
      state.gameLobbyData = null;
    });

    // Game Launch
    builder.addCase(launchGame.pending, (state) => {
      state.launchGameLoader = true;
    });
    builder.addCase(launchGame.fulfilled, (state, action) => {
      state.launchGameLoader = false;
      state.launchGameData = action.payload?.data || null;
    });
    builder.addCase(launchGame.rejected, (state) => {
      state.launchGameLoader = false;
      state.launchGameData = null;
    });

    // System Settings
    builder.addCase(fetchSystemSettings.pending, (state) => {
      state.systemSettingsLoader = true;
    });
    builder.addCase(fetchSystemSettings.fulfilled, (state, action) => {
      state.systemSettingsLoader = false;
      state.systemSettingsData = action.payload?.data || null;
    });
    builder.addCase(fetchSystemSettings.rejected, (state) => {
      state.systemSettingsLoader = false;
    });

    // Live Chat HTML Code
    builder.addCase(fetchLiveChatHtmlCode.pending, (state) => {
      state.liveChatHtmlCodeLoader = true;
    });
    builder.addCase(fetchLiveChatHtmlCode.fulfilled, (state, action) => {
      state.liveChatHtmlCodeLoader = false;
      state.liveChatHtmlCodeData = action.payload?.data || null;
    });
    builder.addCase(fetchLiveChatHtmlCode.rejected, (state) => {
      state.liveChatHtmlCodeLoader = false;
      state.liveChatHtmlCodeData = null;
    });

    // Tracking HTML Code
    builder.addCase(fetchTrackingHtmlCode.pending, (state) => {
      state.trackingHtmlCodeLoader = true;
    });
    builder.addCase(fetchTrackingHtmlCode.fulfilled, (state, action) => {
      state.trackingHtmlCodeLoader = false;
      state.trackingHtmlCodeData = action.payload?.data || null;
    });
    builder.addCase(fetchTrackingHtmlCode.rejected, (state) => {
      state.trackingHtmlCodeLoader = false;
      state.trackingHtmlCodeData = null;
    });

    // Betting History
    builder.addCase(fetchBettingHistory.pending, (state) => {
      state.bettingHistoryLoader = true;
    });
    builder.addCase(fetchBettingHistory.fulfilled, (state, action) => {
      state.bettingHistoryLoader = false;
      state.bettingHistoryData = action.payload || null;
    });
    builder.addCase(fetchBettingHistory.rejected, (state) => {
      state.bettingHistoryLoader = false;
      state.bettingHistoryData = null;
    });

    // Betting Data
    builder.addCase(fetchBettingData.pending, (state) => {
      state.bettingDataLoader = true;
    });
    builder.addCase(fetchBettingData.fulfilled, (state, action) => {
      state.bettingDataLoader = false;
      state.bettingDataData = action.payload?.data || null;
    });
    builder.addCase(fetchBettingData.rejected, (state) => {
      state.bettingDataLoader = false;
      state.bettingDataData = null;
    });

    // Realtime Winners
    builder.addCase(fetchRealtimeWinners.pending, (state) => {
      state.realtimeWinnersLoader = true;
    });
    builder.addCase(fetchRealtimeWinners.fulfilled, (state, action) => {
      state.realtimeWinnersLoader = false;
      state.realtimeWinnersData = action.payload?.data || [];
    });
    builder.addCase(fetchRealtimeWinners.rejected, (state) => {
      state.realtimeWinnersLoader = false;
      state.realtimeWinnersData = [];
    });

    // Realtime Deposits
    builder.addCase(fetchRealtimeDeposits.pending, (state) => {
      state.realtimeDepositsLoader = true;
    });
    builder.addCase(fetchRealtimeDeposits.fulfilled, (state, action) => {
      state.realtimeDepositsLoader = false;
      state.realtimeDepositsData = action.payload?.data || [];
    });
    builder.addCase(fetchRealtimeDeposits.rejected, (state) => {
      state.realtimeDepositsLoader = false;
      state.realtimeDepositsData = [];
    });

    // Realtime Withdrawals
    builder.addCase(fetchRealtimeWithdrawals.pending, (state) => {
      state.realtimeWithdrawalsLoader = true;
    });
    builder.addCase(fetchRealtimeWithdrawals.fulfilled, (state, action) => {
      state.realtimeWithdrawalsLoader = false;
      state.realtimeWithdrawalsData = action.payload?.data || [];
    });
    builder.addCase(fetchRealtimeWithdrawals.rejected, (state) => {
      state.realtimeWithdrawalsLoader = false;
      state.realtimeWithdrawalsData = [];
    });

    // Transaction Request (Generic for both deposit and withdraw)
    builder.addCase(createTransactionRequest.pending, (state) => {
      state.transactionRequestLoader = true;
    });
    builder.addCase(createTransactionRequest.fulfilled, (state, action) => {
      state.transactionRequestLoader = false;
      state.transactionRequestData = action.payload?.data || null;
    });
    builder.addCase(createTransactionRequest.rejected, (state) => {
      state.transactionRequestLoader = false;
      state.transactionRequestData = null;
    });

    // Transaction History
    builder.addCase(fetchTransactionHistory.pending, (state) => {
      state.transactionHistoryLoader = true;
    });
    builder.addCase(fetchTransactionHistory.fulfilled, (state, action) => {
      state.transactionHistoryLoader = false;
      state.transactionHistoryData = action.payload || null;
    });
    builder.addCase(fetchTransactionHistory.rejected, (state) => {
      state.transactionHistoryLoader = false;
      state.transactionHistoryData = null;
    });

    // Banks
    builder.addCase(fetchAllBanks.pending, (state) => {
      state.allBanksLoader = true;
    });
    builder.addCase(fetchAllBanks.fulfilled, (state, action) => {
      state.allBanksLoader = false;
      state.allBanksData = action.payload?.data || [];
    });
    builder.addCase(fetchAllBanks.rejected, (state) => {
      state.allBanksLoader = false;
      state.allBanksData = [];
    });

    // Bank Accounts
    builder.addCase(fetchBankAccounts.pending, (state) => {
      state.bankAccountsLoader = true;
    });
    builder.addCase(fetchBankAccounts.fulfilled, (state, action) => {
      state.bankAccountsLoader = false;
      state.bankAccountsData = action.payload?.data || [];
    });
    builder.addCase(fetchBankAccounts.rejected, (state) => {
      state.bankAccountsLoader = false;
      state.bankAccountsData = [];
    });

    // Providers
    builder.addCase(fetchAllProvider.pending, (state) => {
      state.allProvidersLoader = true;
    });
    builder.addCase(fetchAllProvider.fulfilled, (state, action) => {
      state.allProvidersLoader = false;
      state.allProvidersData = action.payload?.data || [];
    });
    builder.addCase(fetchAllProvider.rejected, (state) => {
      state.allProvidersLoader = false;
      state.allProvidersData = [];
    });

    // Referrals
    builder.addCase(fetchUserReferrals.pending, (state) => {
      state.referralsLoader = true;
    });
    builder.addCase(fetchUserReferrals.fulfilled, (state, action) => {
      state.referralsLoader = false;
      state.referralsData = action.payload || null;
    });
    builder.addCase(fetchUserReferrals.rejected, (state) => {
      state.referralsLoader = false;
      state.referralsData = null;
    });

    // Request Info
    builder.addCase(fetchRequestInfo.pending, (state) => {
      state.requestInfoLoader = true;
    });
    builder.addCase(fetchRequestInfo.fulfilled, (state, action) => {
      state.requestInfoLoader = false;
      state.requestInfoData = action.payload || null;
    });
    builder.addCase(fetchRequestInfo.rejected, (state) => {
      state.requestInfoLoader = false;
      state.requestInfoData = null;
    });

    // Quick Account Inquiry
    builder.addCase(createQuickAccountInquiry.pending, (state) => {
      state.quickAccountInquiryLoader = true;
    });
    builder.addCase(createQuickAccountInquiry.fulfilled, (state, action) => {
      state.quickAccountInquiryLoader = false;
      state.quickAccountInquiryData = action.payload?.data || null;
    });
    builder.addCase(createQuickAccountInquiry.rejected, (state) => {
      state.quickAccountInquiryLoader = false;
      state.quickAccountInquiryData = null;
    });

    // Customer Inquiry Categories
    builder.addCase(fetchCustomerInquiryCategories.pending, (state) => {
      state.customerInquiryCategoriesLoader = true;
    });
    builder.addCase(
      fetchCustomerInquiryCategories.fulfilled,
      (state, action) => {
        state.customerInquiryCategoriesLoader = false;
        state.customerInquiryCategoriesData = action.payload?.data || [];
      },
    );
    builder.addCase(fetchCustomerInquiryCategories.rejected, (state) => {
      state.customerInquiryCategoriesLoader = false;
      state.customerInquiryCategoriesData = [];
    });

    // Create Customer Inquiry
    builder.addCase(createCustomerInquiry.pending, (state) => {
      state.createCustomerInquiryLoader = true;
    });
    builder.addCase(createCustomerInquiry.fulfilled, (state, action) => {
      state.createCustomerInquiryLoader = false;
      state.createCustomerInquiryData = action.payload?.data || null;
    });
    builder.addCase(createCustomerInquiry.rejected, (state) => {
      state.createCustomerInquiryLoader = false;
      state.createCustomerInquiryData = null;
    });

    // All Customer Inquiries
    builder.addCase(fetchAllCustomerInquiries.pending, (state) => {
      state.allCustomerInquiriesLoader = true;
    });
    builder.addCase(fetchAllCustomerInquiries.fulfilled, (state, action) => {
      state.allCustomerInquiriesLoader = false;
      state.allCustomerInquiriesData = action.payload || null;
    });
    builder.addCase(fetchAllCustomerInquiries.rejected, (state) => {
      state.allCustomerInquiriesLoader = false;
      state.allCustomerInquiriesData = null;
    });

    // Delete Customer Inquiry
    builder.addCase(deleteCustomerInquiry.pending, (state) => {
      state.deleteCustomerInquiryLoader = true;
    });
    builder.addCase(deleteCustomerInquiry.fulfilled, (state, action) => {
      state.deleteCustomerInquiryLoader = false;
      state.deleteCustomerInquiryData = action.payload?.data || null;
    });
    builder.addCase(deleteCustomerInquiry.rejected, (state) => {
      state.deleteCustomerInquiryLoader = false;
      state.deleteCustomerInquiryData = null;
    });

    // Customer Inquiry
    builder.addCase(fetchCustomerInquiry.pending, (state) => {
      state.customerInquiryLoader = true;
    });
    builder.addCase(fetchCustomerInquiry.fulfilled, (state, action) => {
      state.customerInquiryLoader = false;
      state.customerInquiryData = action.payload?.data || null;
    });
    builder.addCase(fetchCustomerInquiry.rejected, (state) => {
      state.customerInquiryLoader = false;
      state.customerInquiryData = null;
    });

    // Currencies
    builder.addCase(fetchCurrencies.pending, (state) => {
      state.currenciesLoader = true;
    });
    builder.addCase(fetchCurrencies.fulfilled, (state, action) => {
      state.currenciesLoader = false;
      state.currenciesData = action.payload?.data || state.currenciesData;
    });
    builder.addCase(fetchCurrencies.rejected, (state) => {
      state.currenciesLoader = false;
      state.currenciesData = state.currenciesData;
    });

    // Crypto Payment
    builder.addCase(createCryptoPayment.pending, (state) => {
      state.cryptoPaymentLoader = true;
    });
    builder.addCase(createCryptoPayment.fulfilled, (state, action) => {
      state.cryptoPaymentLoader = false;
      state.cryptoPaymentData = action.payload?.data || action.payload;
    });
    builder.addCase(createCryptoPayment.rejected, (state) => {
      state.cryptoPaymentLoader = false;
      state.cryptoPaymentData = null;
    });

    // Crypto Payment Status
    builder.addCase(getCryptoPaymentStatus.pending, (state) => {
      state.cryptoPaymentStatusLoader = true;
    });
    builder.addCase(getCryptoPaymentStatus.fulfilled, (state, action) => {
      state.cryptoPaymentStatusLoader = false;
      state.cryptoPaymentStatusData = action.payload?.data || action.payload;
    });
    builder.addCase(getCryptoPaymentStatus.rejected, (state) => {
      state.cryptoPaymentStatusLoader = false;
      state.cryptoPaymentStatusData = null;
    });

    // Cancel Crypto Deposit
    builder.addCase(cancelCryptoDeposit.pending, (state) => {
      state.cancelCryptoDepositLoader = true;
    });
    builder.addCase(cancelCryptoDeposit.fulfilled, (state, action) => {
      state.cancelCryptoDepositLoader = false;
      state.cancelCryptoDepositData = action.payload?.data || action.payload;
    });
    builder.addCase(cancelCryptoDeposit.rejected, (state) => {
      state.cancelCryptoDepositLoader = false;
      state.cancelCryptoDepositData = null;
    });

    // Check Pending Deposits
    builder.addCase(checkPendingDeposits.pending, (state) => {
      state.pendingDepositsLoader = true;
    });
    builder.addCase(checkPendingDeposits.fulfilled, (state, action) => {
      state.pendingDepositsLoader = false;
      state.pendingDepositsData = action.payload?.data || action.payload;
    });
    builder.addCase(checkPendingDeposits.rejected, (state) => {
      state.pendingDepositsLoader = false;
      state.pendingDepositsData = null;
    });

    // Crypto Withdrawal
    builder.addCase(createCryptoWithdrawal.pending, (state) => {
      state.cryptoWithdrawalLoader = true;
    });
    builder.addCase(createCryptoWithdrawal.fulfilled, (state, action) => {
      state.cryptoWithdrawalLoader = false;
      state.cryptoWithdrawalData = action.payload.data;
    });
    builder.addCase(createCryptoWithdrawal.rejected, (state) => {
      state.cryptoWithdrawalLoader = false;
      state.cryptoWithdrawalData = null;
    });

    // Address Verification
    builder.addCase(verifyCryptoAddress.pending, (state) => {
      state.addressVerificationLoader = true;
    });
    builder.addCase(verifyCryptoAddress.fulfilled, (state, action) => {
      state.addressVerificationLoader = false;
      state.addressVerificationData = action.payload.data;
    });
    builder.addCase(verifyCryptoAddress.rejected, (state) => {
      state.addressVerificationLoader = false;
      state.addressVerificationData = null;
    });

    // Promotions
    builder.addCase(fetchPromotions.pending, (state) => {
      state.promotionsLoader = true;
    });
    builder.addCase(fetchPromotions.fulfilled, (state, action) => {
      state.promotionsLoader = false;
      state.promotionsData = action.payload?.data || [];
    });
    builder.addCase(fetchPromotions.rejected, (state) => {
      state.promotionsLoader = false;
      state.promotionsData = [];
    });
    builder.addCase(fetchUserPromotionProgress.pending, (state) => {
      state.promotionProgressLoader = true;
    });
    builder.addCase(fetchUserPromotionProgress.fulfilled, (state, action) => {
      state.promotionProgressLoader = false;
      state.promotionProgressData = action.payload?.data || [];
    });
    builder.addCase(fetchUserPromotionProgress.rejected, (state) => {
      state.promotionProgressLoader = false;
      state.promotionProgressData = [];
    });
    builder.addCase(activatePromotion.pending, (state) => {
      state.activatePromotionLoader = true;
    });
    builder.addCase(activatePromotion.fulfilled, (state) => {
      state.activatePromotionLoader = false;
    });
    builder.addCase(activatePromotion.rejected, (state) => {
      state.activatePromotionLoader = false;
    });

    builder.addCase(claimPromotion.pending, (state) => {
      state.claimPromotionLoader = true;
    });
    builder.addCase(claimPromotion.fulfilled, (state) => {
      state.claimPromotionLoader = false;
    });
    builder.addCase(claimPromotion.rejected, (state) => {
      state.claimPromotionLoader = false;
    });

    // Exchange Rate
    builder.addCase(getEstimatedExchangeRate.pending, (state) => {
      state.exchangeRateLoader = true;
    });
    builder.addCase(getEstimatedExchangeRate.fulfilled, (state, action) => {
      state.exchangeRateLoader = false;
      state.exchangeRateData = action.payload.data;
    });
    builder.addCase(getEstimatedExchangeRate.rejected, (state) => {
      state.exchangeRateLoader = false;
      state.exchangeRateData = null;
    });

    // Minimum Deposit Amount
    builder.addCase(getMinimumDepositAmount.pending, (state) => {
      state.minimumDepositAmountLoader = true;
    });
    builder.addCase(getMinimumDepositAmount.fulfilled, (state, action) => {
      state.minimumDepositAmountLoader = false;
      state.minimumDepositAmountData = action.payload?.data || action.payload;
    });
    builder.addCase(getMinimumDepositAmount.rejected, (state) => {
      state.minimumDepositAmountLoader = false;
      state.minimumDepositAmountData = null;
    });

    // Minimum Withdrawal Amount
    builder.addCase(getMinimumWithdrawalAmount.pending, (state) => {
      state.minimumWithdrawalAmountLoader = true;
    });
    builder.addCase(getMinimumWithdrawalAmount.fulfilled, (state, action) => {
      state.minimumWithdrawalAmountLoader = false;
      state.minimumWithdrawalAmountData =
        action.payload?.data || action.payload;
    });
    builder.addCase(getMinimumWithdrawalAmount.rejected, (state) => {
      state.minimumWithdrawalAmountLoader = false;
      state.minimumWithdrawalAmountData = null;
    });
  },
});

export const {
  setSelectedProviderId,
  clearCryptoWithdrawalData,
  clearMinimumDepositAmountData,
  clearMinimumWithdrawalAmountData,
} = websiteSlice.actions;
export default websiteSlice.reducer;
