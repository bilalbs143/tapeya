'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template22/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatPoints } from '@/helpers/formatting';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import {
  clearPreviouslySelectedTab,
  setPreviouslySelectedTab,
} from '@/slices/common/commonSlice';
import {
  fetchRequestInfo,
  fetchTransactionHistory,
} from '@/website/websiteAction';

export default function PointsTab() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { transactionHistoryLoader, transactionHistoryData } = useSelector(
    (state) => state.website,
  );

  // Local pagination state (component-owned)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const requestInfoData = useMemo(
    () => transactionHistoryData?.data || [],
    [transactionHistoryData?.data],
  );

  const totalItems = useMemo(
    () => transactionHistoryData?.meta?.total || 0,
    [transactionHistoryData?.meta?.total],
  );

  // Fetch history on mount and when pagination changes
  useEffect(() => {
    dispatch(
      fetchTransactionHistory({
        subType: 'points',
        perPage: rowsPerPage,
        page: currentPage,
      }),
    );
  }, [dispatch, currentPage, rowsPerPage]);

  const handleConvertClick = () => {
    dispatch(setPreviouslySelectedTab('Points'));
  };

  return (
    <div className="space-y-6">
      {/* Points History Section */}
      <div className="space-y-4">
        {/* Table Container with Fixed Height and Scroll */}
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
                    {t('points')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('details')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('type')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactionHistoryLoader ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      <div className="flex items-center justify-center py-8">
                        <CommonLoader
                          size="lg"
                          border="border-[#D3AF37]"
                        />
                      </div>
                    </td>
                  </tr>
                ) : requestInfoData && requestInfoData.length > 0 ? (
                  requestInfoData.map((item, index) => (
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
                        <span className="text-white transition-all duration-200 hover:text-gray-200">
                          {formatPoints(item.amount)}
                        </span>
                      </td>
                      <td 
                        className="text-white"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        <div className="max-w-xs truncate">
                          {item.category}
                        </div>
                      </td>
                      <td 
                        className="text-white"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        {item.type}
                      </td>
                      <td 
                        className="text-white"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        {formatDateTimeISO(item.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {t('no_records_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>
    </div>
  );
}
