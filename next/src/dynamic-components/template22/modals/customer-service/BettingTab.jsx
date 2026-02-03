'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import Pagination from '@/dynamic-components/template22/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatCurrency } from '@/helpers/formatting';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchBettingHistory } from '@/website/websiteAction';

export default function BettingTab({ showTitle = true, compactTitle = false }) {
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
        <CommonLoader size="lg" border="border-[#D3AF37]" />
      </div>
    );
  }

  // Get betting data array - handle nested structure
  const bettingData = bettingHistoryData?.data || [];

  return (
    <div className="flex h-full flex-col">
      {showTitle && (
        <h3
          className={`${
            compactTitle ? 'mb-2' : 'mb-4'
          } text-[15px] font-bold text-white md:text-[16px]`}
        >
          {t('betting_management')}
        </h3>
      )}

      {/* Match Notes table UI: single bordered container with scrollable table */}
      <div 
        className="overflow-hidden rounded-[4px] border"
        style={{
          backgroundColor: '#2e3338',
          borderColor: 'rgba(0, 0, 0, 0.6)',
          boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
          <table className="w-full min-w-[1100px] table-fixed text-[11px] md:min-w-[1100px] md:text-sm">
            <thead>
              <tr className="border-b-0" style={{ backgroundColor: '#ee5f5b' }}>
                <th className="w-10 text-center text-[12px] font-bold whitespace-nowrap text-white md:w-14 md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('sr')}
                </th>
                <th className="w-[110px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[150px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('provider_name')}
                </th>
                <th className="w-[120px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[160px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('game_type')}
                </th>
                <th className="w-[140px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[170px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('starting_balance')}
                </th>
                <th className="w-[120px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[150px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('bet_amount')}
                </th>
                <th className="w-[120px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[150px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('winning_amount')}
                </th>
                <th className="w-[140px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[170px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('final_amount')}
                </th>
                <th className="w-[90px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[110px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('status')}
                </th>
                <th className="w-[150px] text-left text-[12px] font-bold whitespace-nowrap text-white md:w-[180px] md:text-[14px]" style={{ padding: '7px 10px' }}>
                  {t('time')}
                </th>
              </tr>
            </thead>
            <tbody>
              {bettingData.length === 0 ? (
                <tr>
                  <td 
                    className="text-center text-white" 
                    colSpan="9"
                    style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                  >
                    {t('no_record_found')}
                  </td>
                </tr>
              ) : (
                bettingData.map((item, index) => (
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
                      className="w-12 text-center whitespace-nowrap text-white md:w-14"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {getSerialNumber(index)}
                    </td>
                    <td 
                      className="whitespace-nowrap text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {item.game?.provider || 'N/A'}
                    </td>
                    <td 
                      className="whitespace-nowrap"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      <span className="text-[#D3AF37] transition-all duration-200 hover:text-[#FFF788]">
                        {item.game?.name || 'N/A'}
                      </span>
                    </td>
                    <td 
                      className="whitespace-nowrap text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {formatCurrency(item.holding_money_before_bet || 0)}
                    </td>
                    <td 
                      className="whitespace-nowrap text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {formatCurrency(item.bet || 0)}
                    </td>
                    <td
                      className={`whitespace-nowrap ${getWinAmountClass(item)}`}
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {getDisplayWinAmount(item)}
                    </td>
                    <td 
                      className="whitespace-nowrap text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {formatCurrency(item.holding_money_after_bet || 0)}
                    </td>
                    <td 
                      className="whitespace-nowrap"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      <StatusPill
                        value={getBettingStatusText(item.state_enum)}
                        variant={getStatusVariant(item.state_enum)}
                        size="xs"
                      />
                    </td>
                    <td 
                      className="whitespace-nowrap text-white"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
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
