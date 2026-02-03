'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import Pagination from '@/dynamic-components/template2/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatCurrency } from '@/helpers/formatting';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchBettingHistory } from '@/website/websiteAction';

export default function BettingTab() {
  const dispatch = useDispatch();
  const { bettingHistoryLoader, bettingHistoryData } = useSelector(
    (state) => state.website,
  );
  const { t } = useTranslations();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch betting data when component mounts or pagination changes
  useEffect(() => {
    dispatch(
      fetchBettingHistory({
        perPage: rowsPerPage,
        page: currentPage,
        sort: '-created_at',
      }),
    );
  }, [dispatch, currentPage, rowsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const getSerialNumber = (index) => {
    const totalItems = bettingHistoryData?.meta?.total || 0;
    return calculateIndex(index, currentPage, rowsPerPage, totalItems);
  };

  // Custom status text mapping for betting-specific statuses
  const getBettingStatusText = (status) => {
    return getStatusText(status, t) || status;
  };

  const getWinAmountClass = (item) => {
    if (item.state_enum === 'WIN' && Number(item.win || 0) > 0) {
      return 'text-green-400';
    } else {
      return 'text-white';
    }
  };

  const getDisplayWinAmount = (item) => {
    if (item.state_enum === 'BET' || item.state_enum === 'REFUNDED') {
      return '0';
    } else if (item.state_enum === 'WIN') {
      const winAmount = Number(item.win || 0);
      return winAmount > 0 ? `+${formatCurrency(winAmount)}` : '0';
    } else {
      return '0';
    }
  };

  // Show loading state
  if (bettingHistoryLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#51A2FF]" />
      </div>
    );
  }

  // Get betting data array - handle nested structure
  const bettingData = bettingHistoryData?.data || [];

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
        {t('betting_management')}
      </h3>

      {/* Match Notes table UI: single bordered container with scrollable table */}
      <div className="overflow-hidden rounded-2xl border border-[#FFFFFF66]">
        <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
          <table className="w-full min-w-[1100px] table-fixed text-[11px] md:min-w-[1100px] md:text-sm">
            <thead>
              <tr className="border-b border-[#4B51A3] bg-[#51a2ffa8]">
                <th className="w-10 px-1 py-2 text-center text-[12px] font-bold whitespace-nowrap text-white md:w-14 md:px-2 md:py-3 md:text-[14px]">
                  {t('sr')}
                </th>
                <th className="w-[110px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[150px] md:px-2 md:py-3 md:text-[14px]">
                  {t('provider_name')}
                </th>
                <th className="w-[120px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[160px] md:px-2 md:py-3 md:text-[14px]">
                  {t('game_type')}
                </th>
                <th className="w-[140px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[170px] md:px-2 md:py-3 md:text-[14px]">
                  {t('starting_balance')}
                </th>
                <th className="w-[120px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[150px] md:px-2 md:py-3 md:text-[14px]">
                  {t('bet_amount')}
                </th>
                <th className="w-[120px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[150px] md:px-2 md:py-3 md:text-[14px]">
                  {t('winning_amount')}
                </th>
                <th className="w-[140px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[170px] md:px-2 md:py-3 md:text-[14px]">
                  {t('final_amount')}
                </th>
                <th className="w-[90px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[110px] md:px-2 md:py-3 md:text-[14px]">
                  {t('status')}
                </th>
                <th className="w-[150px] px-1 py-2 text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[180px] md:px-2 md:py-3 md:text-[14px]">
                  {t('time')}
                </th>
              </tr>
            </thead>
            <tbody>
              {bettingData.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-center text-white" colSpan="9">
                    {t('no_record_found')}
                  </td>
                </tr>
              ) : (
                bettingData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-[#FFFFFF66] transition-all duration-300 last:border-b-0 hover:border-[#51A2FF] hover:shadow-[0_0_10px_0_#51A2FF_inset]"
                  >
                    <td className="w-12 px-1 py-2 text-center whitespace-nowrap text-white md:w-14 md:px-2 md:py-3">
                      {getSerialNumber(index)}
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                      {item.game?.provider || 'N/A'}
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap md:px-2 md:py-3">
                      <span className="text-[#51A2FF] transition-all duration-200 hover:text-[#FF9500]">
                        {item.game?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                      {formatCurrency(item.holding_money_before_bet || 0)}
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                      {formatCurrency(item.bet || 0)}
                    </td>
                    <td
                      className={`px-1 py-2 whitespace-nowrap md:px-2 md:py-3 ${getWinAmountClass(item)}`}
                    >
                      {getDisplayWinAmount(item)}
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                      {formatCurrency(item.holding_money_after_bet || 0)}
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap md:px-2 md:py-3">
                      <StatusPill
                        value={getBettingStatusText(item.state_enum)}
                        variant={getStatusVariant(item.state_enum)}
                        size="xs"
                      />
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                      {formatDateTimeISO(item.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Fixed at Bottom */}
      {bettingData.length > 0 && (
        <div className="mt-4 flex-shrink-0">
          <Pagination
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalItems={bettingHistoryData?.meta?.total || bettingData.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}
    </div>
  );
}
