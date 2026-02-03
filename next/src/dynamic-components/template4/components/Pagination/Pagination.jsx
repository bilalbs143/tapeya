'use client';

import React, { useCallback } from 'react';

import { useTranslations } from '@/hooks/useTranslations.js';

const Pagination = ({
  rowsPerPage = 10,
  currentPage = 1,
  totalItems = 0,
  onRowsPerPageChange,
  onPageChange,
  className = '',
}) => {
  const { t } = useTranslations();
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleRowsPerPageChange = useCallback(
    (e) => {
      onRowsPerPageChange(Number(e.target.value));
    },
    [onRowsPerPageChange],
  );

  return (
    <div className={`flex items-center justify-end gap-4 ${className}`}>
      {/* Rows per page selector */}
      <div className="text-xs text-white/60 md:text-sm">
        {t('rows_per_page')}:
        <select
          className="text-grey-400 ml-2 rounded border border-[#FFFFFF66] bg-[#153030] px-2 py-1 text-xs md:text-sm"
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Page information */}
      <div className="flex items-center gap-2 text-xs text-white/60 md:text-sm">
        <span>
          {startItem} - {endItem} of {totalItems}
        </span>

        {/* Navigation arrows */}
        <button
          className={`cursor-pointer p-1 transition-colors ${
            currentPage <= 1
              ? 'text-grey-400 cursor-not-allowed'
              : 'text-[#5AB25A]'
          }`}
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
        >
          <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 9 18" fill="none">
            <path
              d="M8 1L2.12132 6.87868C0.949745 8.05025 0.949748 9.94975 2.12132 11.1213L8 17"
              stroke="#55BC55"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          className={`cursor-pointer p-1 transition-colors ${
            currentPage >= totalPages
              ? 'text-grey-400 cursor-not-allowed'
              : 'text-[#5AB25A]'
          }`}
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 9 18" fill="none">
            <path
              d="M1 1L6.87868 6.87868C8.05025 8.05026 8.05025 9.94975 6.87868 11.1213L1 17"
              stroke="#55BC55"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
