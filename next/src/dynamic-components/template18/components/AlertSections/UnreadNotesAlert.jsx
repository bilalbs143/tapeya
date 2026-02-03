'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PendingExchangeAlert from '@/dynamic-components/template18/components/AlertSections/PendingExchangeAlert';
import UnreadNotesAlert from '@/dynamic-components/template18/components/AlertSections/UnreadNotesAlert';
import { formatCurrency } from '@/helpers/formatting';
import { useAlertsRedux } from '@/hooks/useAlertsRedux';
import { useTranslations } from '@/hooks/useTranslations';
import { closeModal, openModal } from '@/slices/common/commonSlice';

export default function Alert() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const [isVisible, setIsVisible] = useState(false);

  // Get modal props for exchange request alerts
  const modalProps = useSelector((state) => state.common.modalProps);

  // Check if this is an exchange request alert
  const isExchangeRequestAlert =
    modalProps?.type === 'exchange_approved' ||
    modalProps?.type === 'exchange_rejected';

  // Check if this is a customer inquiry reply alert
  const isCustomerInquiryReplyAlert =
    modalProps?.type === 'customer_inquiry_replied';

  // Get alert data from Redux store
  const {
    unreadNotes,
    unreadCount,
    hasUnreadNotes,
    pendingRequests,
    pendingDepositCount,
    pendingWithdrawalCount,
    totalPendingCount,
    hasPendingRequests,
    isLoading,
  } = useAlertsRedux();

  // Determine if we should show the modal
  const shouldShowModal =
    hasUnreadNotes ||
    hasPendingRequests ||
    isExchangeRequestAlert ||
    isCustomerInquiryReplyAlert;

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => dispatch(closeModal('alert')), 250);
  };

  const handleViewInquiry = () => {
    // Close the alert modal first
    dispatch(closeModal('alert'));

    // Then open customer service modal with the specific inquiry
    dispatch(
      openModal({
        modal: 'customerService',
        props: {
          defaultTab: 'inquiry',
          openInquiryId: modalProps?.data?.customerInquiry?.id,
        },
      }),
    );
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[400px] transform rounded-[24px] border border-[#2DFA1A4D] bg-[#3E1D88] p-4 text-white shadow-xl">
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
          <p className="text-sm text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if no alerts to show
  if (!shouldShowModal) {
    return (
      <div className="mx-auto w-full max-w-[400px] transform rounded-[24px] bg-[#3E1D88] p-4 text-white shadow-xl">
        <div className="py-8 text-center">
          <div className="mb-4 text-4xl">✅</div>
          <p className="text-sm text-gray-300">{t('no_data_found')}</p>
          <button
            onClick={handleCloseModal}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-[400px] transform rounded-[5px] border border-[#FEA8034D] bg-[#0E0E0E] text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] transition-all duration-300 ease-out sm:max-w-[500px] lg:max-w-[590px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bring-race text-lg font-bold text-[white] sm:text-xl">
              {t('notifications')}
            </h2>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 43 43"
                fill="none"
              >
                <path
                  d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
                  stroke="#FEA803"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Exchange Request Alert Section */}
            {isExchangeRequestAlert && (
              <div className="space-y-4">
                <div className="rounded-[6px] border border-[#FEA8034D] bg-[#0E0E0E] px-6 py-6 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)]">
                  <div className="text-center">
                    <div className="mb-4 text-6xl">
                      {modalProps.type === 'exchange_approved' ? '✅' : '❌'}
                    </div>
                    <h3
                      className={`mb-2 text-lg font-bold ${modalProps.type === 'exchange_approved' ? 'text-white' : 'text-white'}`}
                    >
                      {modalProps.type === 'exchange_approved'
                        ? t('request_approved')
                        : t('request_rejected')}
                    </h3>

                    {/* Specific message based on type */}
                    <p className="mb-4 text-sm text-gray-300">
                      {modalProps.data?.exchangeRequest?.type === 'deposit'
                        ? modalProps.type === 'exchange_approved'
                          ? t('deposit_request_approved_message')
                          : t('deposit_request_rejected_message')
                        : modalProps.type === 'exchange_approved'
                          ? t('withdrawal_request_approved_message')
                          : t('withdrawal_request_rejected_message')}
                    </p>

                    {/* Transaction Details */}
                    {modalProps.data?.exchangeRequest && (
                      <div className="mt-4 space-y-3">
                        {/* Amount Details */}
                        <div className="mb-4 text-[14px] font-bold text-white">
                          {modalProps.data.exchangeRequest.type === 'deposit'
                            ? t('deposit_amount')
                            : t('withdrawal_amount')}
                        </div>
                        <div className="mt-2 space-y-3">
                          {/* Requested Amount */}
                          <div className="flex items-center justify-between rounded-[5px] border border-[#2C2C2C] px-5 py-3 text-white shadow-inner">
                            <span className="text-sm font-medium">
                              {t('requested_amount')}
                            </span>
                            <span className="border border-[#FEA8034D] bg-[#1A160D] bg-clip-text text-lg font-semibold text-transparent">
                              {formatCurrency(
                                modalProps.data.exchangeRequest.requested_money,
                              )}
                            </span>
                          </div>

                          {/* Approved Amount (only show if approved and exists) */}
                          {modalProps.type === 'exchange_approved' &&
                            modalProps.data.exchangeRequest.approved_money && (
                            <div className="flex items-center justify-between rounded-[5px] border border-[#2C2C2C] px-5 py-3 text-white shadow-inner">
                              <span className="text-sm font-medium">
                                {t('approved_amount')}
                              </span>
                              <span className="border border-[#FEA8034D] bg-[#1A160D] bg-clip-text text-lg font-semibold text-transparent">
                                {formatCurrency(
                                  modalProps.data.exchangeRequest
                                    .approved_money,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Inquiry Reply Alert Section */}
            {isCustomerInquiryReplyAlert && (
              <div className="space-y-4">
                <div className="rounded-[5px] border border-[#FEA8034D] bg-[#0E0E0E] px-3 py-4">
                  <h3 className="border-b border-[#FEA8034D] bg-[#0E0E0E] pb-1 text-sm font-medium text-white">
                    {t('you_have_new_reply') || 'You have a new reply!'}
                  </h3>

                  {/* Inquiry Details */}
                  {modalProps?.data?.customerInquiry && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[5px] border border-[#FEA8034D] bg-[#0E0E0E] px-6 py-4 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)]">
                        <div className="mb-2 text-[14px] font-bold text-white">
                          {t('inquiry_title')}
                        </div>
                        <div className="text-center text-base font-medium text-white">
                          {modalProps.data.customerInquiry.title}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={handleViewInquiry}
                      className="flex w-full cursor-pointer items-center justify-center rounded-[5px] bg-[#DFA336] px-4 pt-3 pb-3 text-sm font-semibold text-black active:scale-95"
                      data-hover={t('view_inquiry')}
                    >
                      {t('view_inquiry')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Unread Notes Section */}
            {hasUnreadNotes &&
              !isExchangeRequestAlert &&
              !isCustomerInquiryReplyAlert && (
              <div className="space-y-4">
                <div className="rounded-[3px] border border-[#FEA8034D] bg-[#0E0E0E] px-3 py-4">
                  <h3 className="border-b border-[#FEA8034D] pb-1 text-sm font-medium text-white">
                    {t('unread_messages')}
                  </h3>
                  <UnreadNotesAlert
                    unreadNotes={unreadNotes}
                    unreadCount={unreadCount}
                    hasUnreadNotes={hasUnreadNotes}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Pending Exchange Requests Section */}
            {hasPendingRequests &&
              !isExchangeRequestAlert &&
              !isCustomerInquiryReplyAlert && (
              <div className="space-y-4">
                {hasUnreadNotes && (
                  <div className="my-8 h-px w-full bg-[#FFFFFF40]" />
                )}
                <h3 className="border-b border-[#0EB47B] bg-[#0E0E0E] pb-1 text-sm font-medium text-[white]">
                  {t('pending_exchange_requests')}
                </h3>
                <PendingExchangeAlert
                  pendingDepositCount={pendingDepositCount}
                  pendingWithdrawalCount={pendingWithdrawalCount}
                  totalPendingCount={totalPendingCount}
                  hasPendingRequests={hasPendingRequests}
                  pendingRequests={pendingRequests}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
