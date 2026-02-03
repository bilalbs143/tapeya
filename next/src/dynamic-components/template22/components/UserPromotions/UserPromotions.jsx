'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template22/components/Pagination/Pagination';
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
    <section className="w-full py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-[var(--font-urbanist)] font-normal text-white italic md:text-2xl lg:text-3xl">
              {t('promotions_user_promotions_title') || 'Your Promotions'}
            </h2>
          </div>
        </div>

        {/* Tabs - match inner dashboard tab style */}
        <div className="mb-6 flex flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 text-white text-[14px] transition-all py-[10px] px-[15px] rounded-[4px] group ml-[2px] mb-[2px]"
                style={{
                  backgroundImage: isActive
                    ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                    : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                  border: '1px solid rgba(0, 0, 0, 0.6)',
                  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundImage =
                      'linear-gradient(#020202, #101112 40%, #191b1d)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundImage =
                      'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                  }
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
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
              /* My Promotions Table - use shared table style */
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
                      <tr
                        className="border-b-0"
                        style={{ backgroundColor: '#ee5f5b' }}
                      >
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('name')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('state')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('turnover')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('net_win_loss')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('activated_at')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('completed_at')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMyPromotions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-white"
                            style={{
                              borderTop: '1px solid #1c1e22',
                              padding: '5px 8px',
                            }}
                          >
                            {t('no_records_found')}
                          </td>
                        </tr>
                      ) : (
                        paginatedMyPromotions.map((progress, index) => (
                          <tr
                            key={progress.promotion_id || index}
                            className="cursor-default border-b border-[#FFFFFF66] transition-all duration-300"
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? '#353a41' : 'transparent',
                            }}
                          >
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              {progress.promotion?.name || '-'}
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
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
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              {formatCurrency(progress.turnover || 0)}
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
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
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              {progress.activated_at
                                ? formatDate(progress.activated_at)
                                : '-'}
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
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
              /* Claim tab: promotion point transactions - shared table style */
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
                      <tr
                        className="border-b-0"
                        style={{ backgroundColor: '#ee5f5b' }}
                      >
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('sr')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('points')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('details')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
                          {t('type')}
                        </th>
                        <th
                          className="text-left text-[12px] font-bold text-white md:text-[14px]"
                          style={{ padding: '7px 10px' }}
                        >
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
                            style={{
                              borderTop: '1px solid #1c1e22',
                              padding: '5px 8px',
                            }}
                          >
                            <CommonLoader />
                          </td>
                        </tr>
                      ) : transactionRows.length ? (
                        transactionRows.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="cursor-default border-b border-[#FFFFFF66] transition-all duration-300"
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? '#353a41' : 'transparent',
                            }}
                          >
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              {calculateIndex(
                                index,
                                currentPage,
                                rowsPerPage,
                                transactionTotal,
                              )}
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              {formatPoints(item.amount)}
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              <span className="line-clamp-2">
                                {item.category}
                              </span>
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
                            >
                              {item.type}
                            </td>
                            <td
                              className="text-white"
                              style={{
                                borderTop: '1px solid #1c1e22',
                                padding: '5px 8px',
                              }}
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
                            style={{
                              borderTop: '1px solid #1c1e22',
                              padding: '5px 8px',
                            }}
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
