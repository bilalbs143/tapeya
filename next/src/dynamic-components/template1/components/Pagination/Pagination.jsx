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
      <div className="text-xs text-white md:text-sm">
        {t('rows_per_page')}:
        <select
          className="ml-2 rounded border border-[#4B51A3] bg-transparent px-2 py-1 text-xs text-white md:text-sm"
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
      <div className="flex items-center gap-2 text-xs text-white md:text-sm">
        <span>
          {startItem} - {endItem} of {totalItems}
        </span>

        {/* Navigation arrows */}
        <button
          className={`cursor-pointer p-1 transition-colors ${
            currentPage <= 1
              ? 'cursor-not-allowed text-[#4B51A3]'
              : 'text-white hover:text-[#FC7E09]'
          }`}
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
        >
          <svg
            className="h-3 w-3 md:h-4 md:w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          className={`cursor-pointer p-1 transition-colors ${
            currentPage >= totalPages
              ? 'cursor-not-allowed text-[#4B51A3]'
              : 'text-white hover:text-[#FC7E09]'
          }`}
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <svg
            className="h-3 w-3 md:h-4 md:w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
