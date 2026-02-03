'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import Pagination from '@/dynamic-components/template9/components/Pagination/Pagination';
import TransactionDetail from '@/dynamic-components/template9/components/TransactionDetail/TransactionDetail.jsx';
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

  // Row details
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

  return (
    <div className="space-y-6">
      {showDetails ? (
        <TransactionDetail
          title={t('payment_details')}
          data={selectedItem || {}}
          onClose={() => {
            setShowDetails(false);
            setSelectedItem(null);
          }}
          type="withdrawal"
        />
      ) : (
        <>
          {/* Table Container with Fixed Height and Scroll - match DepositHistory UI */}
          <div className="overflow-hidden rounded-[9px] border border-[#DBB42C4D]">
            <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
              <table className="w-full min-w-[720px] table-fixed text-[11px] md:text-sm">
                <thead>
                  <tr className="border-b-0 border-[#DBB42C4D] bg-[#12001F]">
                    <th className="w-12 px-1 py-2 text-center text-[12px] font-bold text-white md:w-14 md:px-2 md:py-3 md:text-[14px]">
                      {t('sr')}
                    </th>
                    <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('application_amount')} ({getCurrency()})
                    </th>
                    <th className="px-2 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('pay_price')} (Crypto)
                    </th>
                    <th className="px-2 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('actually_paid_crypto')}
                    </th>
                    <th className="px-2 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('paid_amount')} ({getCurrency()})
                    </th>
                    <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('status')}
                    </th>
                    <th className="px-2 py-2 text-center text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('details')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requestInfoLoader ? (
                    <tr>
                      <td
                        className="px-2 py-3 text-center text-white"
                        colSpan="7"
                      >
                        <div className="flex items-center justify-center py-8">
                          <CommonLoader size="lg" border="border-[#9d4edd]" />
                        </div>
                      </td>
                    </tr>
                  ) : requestInfoData?.data &&
                    requestInfoData.data.length > 0 ? (
                    requestInfoData.data.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="cursor-pointer border border-[#DBB42C4D] transition-all duration-300 hover:border-[#DBB42C4D] hover:bg-[#12001F] hover:shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetails(true);
                        }}
                      >
                        <td className="w-12 px-1 py-2 text-center text-white md:w-14 md:px-2 md:py-3">
                          {calculateIndex(
                            index,
                            currentPage,
                            rowsPerPage,
                            totalItems,
                          )}
                        </td>
                        <td className="px-1 py-2 md:px-2 md:py-3">
                          <span className="text-[#DBB42C] transition-all duration-200">
                            {formatCurrency(item.requested_money)}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-white md:px-2 md:py-3">
                          {item.via_enum === 'CRYPTO'
                            ? item.pay_price || '---'
                            : '---'}
                        </td>
                        <td className="px-2 py-2 text-white md:px-2 md:py-3">
                          {item.via_enum === 'CRYPTO'
                            ? item.paid_amount || '---'
                            : '---'}
                        </td>
                        <td className="px-2 py-2 text-white md:px-2 md:py-3">
                          {formatCurrency(item.approved_money) || '---'}
                        </td>
                        <td className="px-1 py-2 text-white md:px-2 md:py-3">
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
                        <td className="px-2 py-2 text-center md:px-2 md:py-3">
                          <button className="btn-hover-outline rounded-[6px] border border-[#DBB42C4D] bg-transparent px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#9D4EDD] hover:text-white">
                            {t('details')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-2 py-3 text-center text-white"
                        colSpan="7"
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
          <div className="flex w-[full] flex-col items-center gap-3 md:flex-row md:justify-end">
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
        </>
      )}
    </div>
  );
}
