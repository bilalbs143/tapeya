'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import Pagination from '@/dynamic-components/template22/components/Pagination/Pagination';
import TransactionDetail from '@/dynamic-components/template22/components/TransactionDetail/TransactionDetail.jsx';
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
          <div 
            className="overflow-hidden rounded-[4px] border"
            style={{
              backgroundColor: '#2e3338',
              borderColor: 'rgba(0, 0, 0, 0.6)',
              boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
              <table className="w-full min-w-[720px] table-fixed text-[11px] md:text-sm">
                <thead>
                  <tr className="border-b-0" style={{ backgroundColor: '#ee5f5b' }}>
                    <th className="w-12 text-center text-[12px] font-bold text-white md:w-14 md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('sr')}
                    </th>
                    <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('application_amount')} ({getCurrency()})
                    </th>
                    <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('pay_price')} (Crypto)
                    </th>
                    <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('actually_paid_crypto')}
                    </th>
                    <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('paid_amount')} ({getCurrency()})
                    </th>
                    <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('status')}
                    </th>
                    <th className="text-center text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                      {t('details')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requestInfoLoader ? (
                    <tr>
                      <td
                        className="text-center text-white"
                        colSpan="7"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
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
                        className="cursor-pointer border-b border-[#FFFFFF66] transition-all duration-300"
                        style={{
                          backgroundColor: index % 2 === 0 ? '#353a41' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#49515a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#353a41' : 'transparent';
                        }}
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetails(true);
                        }}
                      >
                        <td 
                          className="w-12 text-center text-white md:w-14"
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
                          {calculateIndex(
                            index,
                            currentPage,
                            rowsPerPage,
                            totalItems,
                          )}
                        </td>
                        <td 
                          className=""
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
                          <span className="text-[#D3AF37] transition-all duration-200">
                            {formatCurrency(item.requested_money)}
                          </span>
                        </td>
                        <td 
                          className="text-white"
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
                          {item.via_enum === 'CRYPTO'
                            ? item.pay_price || '---'
                            : '---'}
                        </td>
                        <td 
                          className="text-white"
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
                          {item.via_enum === 'CRYPTO'
                            ? item.paid_amount || '---'
                            : '---'}
                        </td>
                        <td 
                          className="text-white"
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
                          {formatCurrency(item.approved_money) || '---'}
                        </td>
                        <td 
                          className="text-white"
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
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
                        <td 
                          className="text-center"
                          style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                        >
                          <button className="btn-hover-outline rounded-[6px] border bg-transparent px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:opacity-90" style={{ borderColor: '#74cae3' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundImage = 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'transparent'; }}>
                            {t('details')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="text-center text-white"
                        colSpan="7"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
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
        </>
      )}
    </div>
  );
}
