'use client';

import React, { useCallback } from 'react';

import { useTranslations } from '@/hooks/useTranslations.js';

const Pagination = ({
  rowsPerPage = 10,
  currentPage = 1,
  totalItems = 0,
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

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-3 md:flex-row md:justify-end ${className}`}
    >
      <div className="group relative mr-1 inline-flex w-full items-center justify-center gap-4 px-8 py-2 text-[16px] font-semibold tracking-wide text-white uppercase before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#2DFA1A4D] before:bg-[#060D0D] before:shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] before:transition-all before:duration-300 md:w-auto">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          className={`relative z-10 flex items-center justify-center transition-all ${
            currentPage <= 1
              ? 'cursor-not-allowed opacity-40'
              : 'hover:scale-110 active:scale-95'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="7"
            height="11"
            viewBox="0 0 7 11"
            fill="none"
          >
            <path
              d="M0.293045 5.795L4.37883 9.88078C5.0088 10.5107 6.08594 10.0646 6.08594 9.17368V1.0021C6.08594 0.111199 5.00879 -0.334967 4.37883 0.294998L0.293044 4.38078C-0.0974798 4.77131 -0.0974793 5.40447 0.293045 5.795Z"
              fill="#2DFA1A"
            />
          </svg>
        </button>

        <p className="relative z-10 text-[16px] font-[600] tracking-wide text-[#FFFFFF]">
          {startItem} - {endItem} {t('of')} {totalItems}
        </p>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className={`relative z-10 flex items-center justify-center transition-all ${
            currentPage >= totalPages
              ? 'cursor-not-allowed opacity-40'
              : 'hover:scale-110 active:scale-95'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="7"
            height="11"
            viewBox="0 0 7 11"
            fill="none"
          >
            <path
              d="M5.79289 5.795L1.70711 9.88078C1.07714 10.5107 0 10.0646 0 9.17368V1.0021C0 0.111199 1.07714 -0.334967 1.70711 0.294998L5.79289 4.38078C6.18342 4.77131 6.18342 5.40447 5.79289 5.795Z"
              fill="#2DFA1A"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
