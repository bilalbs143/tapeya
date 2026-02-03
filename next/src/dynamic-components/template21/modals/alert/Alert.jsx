'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PendingExchangeAlert from '@/dynamic-components/template21/components/AlertSections/PendingExchangeAlert';
import UnreadNotesAlert from '@/dynamic-components/template21/components/AlertSections/UnreadNotesAlert';
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
      <div className="mx-auto w-full max-w-[400px] transform rounded-[24px] bg-[#312577] p-4 text-white shadow-xl">
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
      <div className="mx-auto w-full max-w-[400px] transform rounded-[24px] bg-[#312577] p-4 text-white shadow-xl">
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
      className={`mx-auto w-full max-w-[400px] transform rounded-[12px] p-[1px] text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[500px] lg:max-w-[590px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)' }}
    >
      <div className="rounded-[12px] bg-black p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
              {t('notifications')}
            </h2>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="group flex h-[33px] w-[33px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition-all duration-300 sm:h-[44px] sm:w-[44px]"
              style={{
                backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Exchange Request Alert Section */}
            {isExchangeRequestAlert && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mb-4 text-6xl">
                    {modalProps.type === 'exchange_approved' ? '✅' : '❌'}
                  </div>
                  <h3
                    className={`mb-2 text-lg font-bold ${modalProps.type === 'exchange_approved' ? 'text-green-400' : 'text-red-400'}`}
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
                      <div className="rounded-[12px] bg-black px-6 py-8">
                        <div className="mb-2 text-[14px] font-bold text-white">
                          {modalProps.data.exchangeRequest.type === 'deposit'
                            ? t('deposit_amount')
                            : t('withdrawal_amount')}
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div
                            className={`rounded-[10px] border border-[#FFFFFF40] bg-[#ffffff0d] px-4 py-4 ${modalProps.type !== 'exchange_approved' || !modalProps.data.exchangeRequest.approved_money ? 'md:col-span-2' : ''}`}
                          >
                            <div className="text-center text-base font-bold text-white md:text-lg">
                              {formatCurrency(
                                modalProps.data.exchangeRequest.requested_money,
                              )}
                            </div>
                          </div>
                          {modalProps.type === 'exchange_approved' &&
                            modalProps.data.exchangeRequest.approved_money && (
                            <div className="rounded-[10px] border border-[#FFFFFF40] bg-[#ffffff0d] px-4 py-4">
                              <div className="text-center text-base font-bold text-white md:text-lg">
                                {formatCurrency(
                                  modalProps.data.exchangeRequest
                                    .approved_money,
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column Headings for Two Amounts */}
                        {modalProps.type === 'exchange_approved' &&
                          modalProps.data.exchangeRequest.approved_money && (
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div className="text-center text-xs text-gray-400">
                              {t('requested_amount')}
                            </div>
                            <div className="text-center text-xs text-gray-400">
                              {t('approved_amount')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Inquiry Reply Alert Section */}
            {isCustomerInquiryReplyAlert && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mb-4 text-6xl">💬</div>
                  <h3 className="mb-2 text-lg font-bold text-[#10B981]">
                    {t('you_have_new_reply') || 'You have a new reply!'}
                  </h3>
                  <p className="mb-4 text-sm text-gray-300">
                    {t('your_inquiry_has_been_replied') ||
                      'Your inquiry has received a new reply.'}
                  </p>

                  {/* Inquiry Details */}
                  {modalProps?.data?.customerInquiry && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[12px] bg-black px-6 py-4">
                        <div className="mb-2 text-[14px] font-bold text-white">
                          {t('inquiry_title')}
                        </div>
                        <div className="text-center text-base font-medium text-[#10B981]">
                          {modalProps.data.customerInquiry.title}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleViewInquiry}
                  className="flex w-full cursor-pointer items-center justify-center rounded-[10px] px-4 pt-3 pb-4 text-sm font-semibold text-white active:scale-95"
                  style={{
                    backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                  }}
                  data-hover={t('view_inquiry')}
                >
                  {t('view_inquiry')}
                </button>
              </div>
            )}

            {/* Unread Notes Section */}
            {hasUnreadNotes &&
              !isExchangeRequestAlert &&
              !isCustomerInquiryReplyAlert && (
              <div className="space-y-4">
                <h3 className="border-b border-[#E8D25E] pb-1 text-sm font-medium text-[#D3AF37]">
                  {t('unread_messages')}
                </h3>
                <UnreadNotesAlert
                  unreadNotes={unreadNotes}
                  unreadCount={unreadCount}
                  hasUnreadNotes={hasUnreadNotes}
                  isLoading={isLoading}
                />
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
                <h3 className="border-b border-[#10B981] pb-1 text-sm font-medium text-[#10B981]">
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
