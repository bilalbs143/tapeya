'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template18/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatPoints } from '@/helpers/formatting';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { setPreviouslySelectedTab } from '@/slices/common/commonSlice';
import { fetchTransactionHistory } from '@/website/websiteAction';

export default function CouponsTab() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { transactionHistoryLoader, transactionHistoryData } = useSelector(
    (state) => state.website,
  );

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

  useEffect(() => {
    dispatch(
      fetchTransactionHistory({
        subType: 'coupon_points',
        perPage: rowsPerPage,
        page: currentPage,
      }),
    );
  }, [dispatch, currentPage, rowsPerPage]);

  const handleConvertClick = () => {
    dispatch(setPreviouslySelectedTab('Coupons'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[5px] border border-[#11234D] md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 md:mt-2 md:pl-4">
          <h3 className="text-[15px] font-bold text-white md:text-[25px]">
            {t('coupon_points_title')}
          </h3>
          <button
            onClick={handleConvertClick}
            className="filled-hover-effect flex cursor-pointer items-center justify-center rounded-[6px] bg-[#FFB703] px-6 pt-3 pb-3 text-[14px] font-semibold text-black transition-all duration-200 active:scale-95 md:mr-4"
          >
            <span>{t('convert_coupons_to_game_wallet')}</span>
          </button>
        </div>

        {/* Coupons History Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex h-[400px] flex-col md:h-[500px]">
              <div className="overflow-x-auto md:overflow-x-visible">
                <div className="inline-block w-full min-w-[680px] align-top md:p-3">
                  {/* Table Header */}
                  <div className="overflow-hidden rounded-t-[9px] border border-b-0 border-[#11234D]">
                    <table className="w-full table-fixed text-[11px] md:text-sm">
                      <thead>
                        <tr className="border-b-0 border-[#11234D] bg-[#081126]">
                          <th className="w-12 px-1 py-2 text-center text-xs font-bold text-white md:w-14 md:text-[14px]">
                            {t('sr')}
                          </th>
                          <th className="px-1 py-2 text-left text-xs font-bold text-white md:text-[14px]">
                            {t('coupon_points_title')}
                          </th>
                          <th className="px-1 py-2 text-left text-xs font-bold text-white md:text-[14px]">
                            {t('details')}
                          </th>
                          <th className="px-1 py-2 text-left text-xs font-bold text-white md:text-[14px]">
                            {t('type')}
                          </th>
                          <th className="px-1 py-2 text-left text-xs font-bold text-white md:text-[14px]">
                            {t('date')}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  {/* Table Body */}
                  <div className="show-scrollbar flex-1 overflow-y-auto">
                    <div className="overflow-hidden rounded-b-[9px] border border-t-0 border-[#11234D]">
                      <table className="w-full table-fixed text-[11px] md:text-sm">
                        <tbody>
                          {transactionHistoryLoader ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-8 text-center text-white"
                              >
                                <CommonLoader
                                  size="lg"
                                  border="border-[#CBBC91]"
                                />
                              </td>
                            </tr>
                          ) : requestInfoData && requestInfoData.length > 0 ? (
                            requestInfoData.map((item, index) => (
                              <tr
                                key={item.id || index}
                                className="border-b border-[#11234D] transition-all duration-300 last:border-b-0 hover:border-[#CBBC9133] hover:bg-[#0F50451A] hover:shadow-[inset_0_4px_24px_0_rgba(255,183,3,0.30)]"
                              >
                                <td className="text-center text-white">
                                  {calculateIndex(
                                    index,
                                    currentPage,
                                    rowsPerPage,
                                    totalItems,
                                  )}
                                </td>
                                <td>
                                  <span className="text-[#FFB703]">
                                    {formatPoints(item.amount)}
                                  </span>
                                </td>
                                <td className="truncate text-white">
                                  {item.category}
                                </td>
                                <td className="text-white">{item.type}</td>
                                <td className="text-white">
                                  {formatDateTimeISO(item.created_at)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="text-center text-white"
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
      </div>
    </div>
  );
}
