'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import Pagination from '@/dynamic-components/template21/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatCurrency } from '@/helpers/formatting';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchRequestInfo } from '@/website/websiteAction';

export default function WithdrawalHistory() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  const { requestInfoLoader, requestInfoData } = useSelector(
    (state) => state.website,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const totalItems = requestInfoData?.meta?.total || 0;

  useEffect(() => {
    dispatch(
      fetchRequestInfo({
        type: 'withdraw',
        perPage: rowsPerPage,
        page: currentPage,
      }),
    );
  }, [dispatch, currentPage, rowsPerPage, refreshCounter]);

  useEffect(() => {
    const handleRefresh = (e) => {
      // If a specific type is provided, respect it; otherwise refresh for generic events
      if (!e?.detail?.type || e.detail.type === 'withdraw') {
        setRefreshCounter((n) => n + 1);
      }
    };
    window.addEventListener('requestInfo:refresh', handleRefresh);
    return () =>
      window.removeEventListener('requestInfo:refresh', handleRefresh);
  }, []);

  // Map via_enum to translation key (same as TransactionDetail / locale keys)
  const getPaymentTypeLabel = (value) => {
    if (!value) return '---';
    const keyMap = {
      BANK_TRANSFER: 'bank_transfer',
      CRYPTO: 'crypto',
      DIGITAL_WALLET: 'e_wallet',
      PULSA: 'pulsa',
    };
    const key = keyMap[value.toUpperCase?.()] || value?.toLowerCase?.();
    return t(key) || value;
  };

  return (
    <div className="space-y-6">
      {/* Table Container with Fixed Height and Scroll - match DepositHistory UI */}
      <div className="overflow-hidden rounded-[4px] border border-black/60 bg-[#2e3338] shadow-[0px_3px_5px_0px_rgba(0,0,0,0.4)]">
        <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
          <table className="w-full min-w-[720px] table-fixed text-[11px] md:text-sm">
            <thead>
              <tr className="border-b-0 bg-[#ee5f5b]">
                <th className="w-12 px-[10px] py-[7px] text-center text-[12px] font-bold text-white md:w-14 md:text-[14px]">
                  {t('sr')}
                </th>
                <th className="px-[10px] py-[7px] text-left text-[12px] font-bold text-white md:text-[14px]">
                  {t('application_amount')} ({getCurrency()})
                </th>
                <th className="px-[10px] py-[7px] text-left text-[12px] font-bold text-white md:text-[14px]">
                  {t('paid_amount')} ({getCurrency()})
                </th>
                <th className="px-[10px] py-[7px] text-left text-[12px] font-bold text-white md:text-[14px]">
                  {t('status')}
                </th>
                <th className="px-[10px] py-[7px] text-left text-[12px] font-bold text-white md:text-[14px]">
                  {t('payment_type')}
                </th>
                <th className="px-[10px] py-[7px] text-left text-[12px] font-bold text-white md:text-[14px]">
                  {t('created_at')}
                </th>
              </tr>
            </thead>
            <tbody>
              {requestInfoLoader ? (
                <tr>
                  <td
                    className="border-t border-[#1c1e22] px-[8px] py-[5px] text-center text-white"
                    colSpan="6"
                  >
                    <div className="flex items-center justify-center py-8">
                      <CommonLoader size="lg" border="border-[#D3AF37]" />
                    </div>
                  </td>
                </tr>
              ) : requestInfoData?.data &&
                requestInfoData.data.length > 0 ? (
                requestInfoData.data.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`border-b border-[#FFFFFF66] transition-all duration-300 hover:bg-[#49515a] ${
                      index % 2 === 0 ? 'bg-[#353a41]' : 'bg-transparent'
                    }`}
                  >
                    <td className="w-12 border-t border-[#1c1e22] px-[8px] py-[5px] text-center text-white md:w-14">
                      {calculateIndex(
                        index,
                        currentPage,
                        rowsPerPage,
                        totalItems,
                      )}
                    </td>
                    <td className="border-t border-[#1c1e22] px-[8px] py-[5px]">
                      <span className="text-[#D3AF37] transition-all duration-200">
                        {formatCurrency(item.requested_money)}
                      </span>
                    </td>
                    <td className="border-t border-[#1c1e22] px-[8px] py-[5px] text-white">
                      {formatCurrency(item.approved_money) || '---'}
                    </td>
                    <td className="border-t border-[#1c1e22] px-[8px] py-[5px] text-white">
                      <StatusPill
                        value={
                          getStatusText(
                            item.status_enum?.toLowerCase(),
                            t,
                          ) || item.status_enum
                        }
                        variant={getStatusVariant(
                          item.status_enum?.toLowerCase(),
                        )}
                        size="xs"
                      />
                    </td>
                    <td className="border-t border-[#1c1e22] px-[8px] py-[5px] text-white">
                      {getPaymentTypeLabel(item.via_enum || item.via)}
                    </td>
                    <td className="whitespace-nowrap border-t border-[#1c1e22] px-[8px] py-[5px] text-white">
                      {formatDateTimeISO(item.created_at) || '---'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border-t border-[#1c1e22] px-[8px] py-[5px] text-center text-white"
                    colSpan="6"
                  >
                    {t('no_withdraw_records_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Completely separate container */}
      <div className="flex justify-end">
        <div>
          <Pagination
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
