'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template10/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatPoints } from '@/helpers/formatting';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchTransactionHistory } from '@/website/websiteAction';

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

  return (
    <div className="space-y-6">
      {/* Points History Section */}
      <div className="space-y-4">
        {/* Table Container with Fixed Height and Scroll */}
        <div className="flex h-[400px] flex-col md:h-[500px]">
          {/* Horizontal scroll wrapper on mobile */}
          <div className="overflow-x-auto md:overflow-x-visible">
            <div className="inline-block w-full min-w-[720px] align-top">
              {/* Table Header - Fixed */}
              <div className="overflow-hidden rounded-t-[7px] border border-b-0 border-[#E33A2480]">
                <table className="w-full table-fixed text-[11px] md:text-sm">
                  <thead>
                    <tr className="border-b-0 border-[#E33A2480] bg-[#1D4647]">
                      <th className="w-12 px-1 py-2 text-center text-xs font-bold text-white md:w-14 md:px-2 md:py-3 md:text-[14px]">
                        {t('sr')}
                      </th>
                      <th className="px-1 py-2 text-left text-xs font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('points')}
                      </th>
                      <th className="px-1 py-2 text-left text-xs font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('details')}
                      </th>
                      <th className="px-1 py-2 text-left text-xs font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('type')}
                      </th>
                      <th className="px-1 py-2 text-left text-xs font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('date')}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Table Body - Scrollable with visible scrollbar */}
              <div className="show-scrollbar flex-1 overflow-y-auto">
                <div className="overflow-hidden rounded-b-[7px] border border-t-0 border-[#E33A2480]">
                  <table className="w-full table-fixed text-[11px] md:text-sm">
                    <tbody>
                      {transactionHistoryLoader ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-1 py-2 text-center text-white md:px-2 md:py-3"
                          >
                            <div className="flex items-center justify-center py-8">
                              <CommonLoader
                                size="lg"
                                border="border-[#1D4647]"
                              />
                            </div>
                          </td>
                        </tr>
                      ) : requestInfoData && requestInfoData.length > 0 ? (
                        requestInfoData.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="cursor-pointer border border-[#E33A2480] transition-all duration-300 last:border-b-0 hover:border-[#E33A2480] hover:bg-[#172F31CC] hover:shadow-[inset_0_4px_14px_0_rgba(227,58,36,0.50)]"
                          >
                            <td className="w-12 px-1 py-2 text-center text-[12px] font-normal text-[#FFFFFF99] md:w-14 md:px-2 md:py-3">
                              {calculateIndex(
                                index,
                                currentPage,
                                rowsPerPage,
                                totalItems,
                              )}
                            </td>
                            <td className="px-1 py-2 md:px-2 md:py-3">
                              <span className="text-[12px] font-normal text-[#E33A24]/50 transition-all duration-200 hover:text-[#FFFFFF99]">
                                {formatPoints(item.amount)}
                              </span>
                            </td>
                            <td className="px-1 py-2 text-[12px] font-normal text-[#FFFFFF99] md:px-2 md:py-3">
                              <div className="max-w-xs truncate">
                                {item.category}
                              </div>
                            </td>
                            <td className="px-1 py-2 text-[12px] font-normal text-[#FFFFFF99] md:px-2 md:py-3">
                              {item.type}
                            </td>
                            <td className="px-1 py-2 text-[12px] font-normal text-[#FFFFFF99] md:px-2 md:py-3">
                              {formatDateTimeISO(item.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-1 py-2 text-center font-normal text-[#FFFFFF99] md:px-2 md:py-3"
                          >
                            {t('no_records_found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
