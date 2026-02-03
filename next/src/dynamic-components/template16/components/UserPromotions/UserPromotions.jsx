'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template16/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import {
  fetchPromotions,
  fetchTransactionHistory,
  fetchUserPromotionProgress,
} from '@/website/websiteAction';

export default function UserPromotions() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const promotionProgressData =
    useSelector((state) => state.website.promotionProgressData) || [];
  const promotionsLoader = useSelector(
    (state) => state.website.promotionsLoader,
  );
  const promotionProgressLoader = useSelector(
    (state) => state.website.promotionProgressLoader,
  );
  const transactionHistoryData = useSelector(
    (state) => state.website.transactionHistoryData,
  );
  const transactionHistoryLoader = useSelector(
    (state) => state.website.transactionHistoryLoader,
  );

  const [activeTab, setActiveTab] = useState('my-promotions');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Removed claim filter dropdown per request
  const myPromotionsRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-GB');
  };

  // Fetch promotions and progress
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchPromotions());
    }
  }, [dispatch, isAuth]);

  useEffect(() => {
    if (isAuth) {
      dispatch(
        fetchUserPromotionProgress({
          page: currentPage,
          perPage: rowsPerPage,
        }),
      );
    }
  }, [dispatch, isAuth, currentPage, rowsPerPage]);

  // Fetch promotion point transactions when on claim tab to reuse existing transactions API
  useEffect(() => {
    if (isAuth && activeTab === 'claim') {
      dispatch(
        fetchTransactionHistory({
          subType: 'points',
          category: 'promotion_points',
          source: 'promotion',
          perPage: rowsPerPage,
          page: currentPage,
          sort: '-id',
        }),
      );
    }
  }, [dispatch, isAuth, activeTab, currentPage, rowsPerPage]);

  const progressList = Array.isArray(promotionProgressData?.data)
    ? promotionProgressData.data
    : promotionProgressData || [];
  const progressTotal =
    promotionProgressData?.meta?.total ??
    (Array.isArray(progressList) ? progressList.length : 0);

  const transactionRows = transactionHistoryData?.data || [];
  const transactionTotal =
    transactionHistoryData?.meta?.total ??
    (Array.isArray(transactionRows) ? transactionRows.length : 0);

  // Tab 1: My Promotions - Use promotionProgress data directly
  const myPromotionsTableData = useMemo(() => {
    if (!isAuth || !progressList?.length) return [];
    return progressList;
  }, [progressList, isAuth]);

  // Paginate My Promotions table data
  const paginatedMyPromotions = myPromotionsTableData;

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Don't show component if not authenticated
  if (!isAuth) {
    return null;
  }

  const tabs = [
    { id: 'my-promotions', label: t('promotions_my_promotions') },
    { id: 'claim', label: t('promotions_claim') },
  ];

  const isLoading = promotionsLoader || promotionProgressLoader;

  return (
    <section className="w-full bg-black py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-[var(--font-urbanist)] font-normal text-white italic md:text-2xl lg:text-3xl">
              {t('promotions_user_promotions_title') || 'Your Promotions'}
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex w-full gap-2 overflow-x-auto rounded-[666px] bg-[#151515] px-3 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-[#E8D25E33] sm:gap-3 sm:px-6 sm:py-4.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 self-stretch rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 sm:gap-2.5 sm:rounded-[60px] sm:px-6 sm:py-4 sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-[#E8D25E] text-black shadow-[0_6px_18px_rgba(232,210,94,0.35)]'
                  : 'bg-[#0F0F0F] text-white hover:bg-[#141414]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <CommonLoader />
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {activeTab === 'my-promotions' ? (
              /* My Promotions Table */
              <div className="overflow-hidden rounded-[20px] bg-[#101010] shadow-[0_15px_50px_rgba(0,0,0,0.45)] ring-1 ring-[#E8D25E29] backdrop-blur-[6px]">
                <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="rounded-t-2xl bg-gradient-to-r from-[#1C1C1C] to-[#111111]">
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('name')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('state')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('turnover')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('net_win_loss')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('activated_at')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('completed_at')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMyPromotions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-sm text-white"
                          >
                            {t('no_records_found')}
                          </td>
                        </tr>
                      ) : (
                        paginatedMyPromotions.map((progress, index) => (
                          <tr
                            key={progress.promotion_id || index}
                            className={`h-11 sm:h-14 ${
                              index % 2 === 0 ? 'bg-[#141414]' : 'bg-[#0F0F0F]'
                            }`}
                          >
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {progress.promotion?.name || '-'}
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                  progress.state_enum === 'ACTIVATED'
                                    ? 'bg-[#E8D25E] text-black'
                                    : progress.state_enum === 'COMPLETED'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-500 text-white'
                                }`}
                              >
                                {t(progress.state_enum.toLowerCase())}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {formatCurrency(progress.turnover || 0)}
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              <span
                                className={
                                  (progress.net_win_loss || 0) >= 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }
                              >
                                {formatCurrency(progress.net_win_loss || 0)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {progress.activated_at
                                ? formatDate(progress.activated_at)
                                : '-'}
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {progress.completed_at
                                ? formatDate(progress.completed_at)
                                : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Claim tab: promotion point transactions */
              <div className="overflow-hidden rounded-[20px] bg-[#101010] shadow-[0_15px_50px_rgba(0,0,0,0.45)] ring-1 ring-[#E8D25E29] backdrop-blur-[6px]">
                <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="rounded-t-2xl bg-gradient-to-r from-[#1C1C1C] to-[#111111]">
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('sr')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('points')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('details')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('type')}
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                          {t('date')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionHistoryLoader ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-sm text-white"
                          >
                            <CommonLoader />
                          </td>
                        </tr>
                      ) : transactionRows.length ? (
                        transactionRows.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className={`h-11 sm:h-14 ${
                              index % 2 === 0 ? 'bg-[#141414]' : 'bg-[#0F0F0F]'
                            }`}
                          >
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {calculateIndex(
                                index,
                                currentPage,
                                rowsPerPage,
                                transactionTotal,
                              )}
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {formatPoints(item.amount)}
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              <span className="line-clamp-2">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {item.type}
                            </td>
                            <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                              {formatDateTimeISO(item.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-sm text-white"
                          >
                            {t('no_records_found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {(activeTab === 'my-promotions'
              ? (progressTotal ?? myPromotionsTableData.length)
              : transactionTotal) > 0 && (
              <div className="mt-6">
                <Pagination
                  rowsPerPage={rowsPerPage}
                  currentPage={currentPage}
                  totalItems={
                    activeTab === 'my-promotions'
                      ? (progressTotal ?? myPromotionsTableData.length)
                      : transactionTotal
                  }
                  onRowsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setCurrentPage(1);
                  }}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
