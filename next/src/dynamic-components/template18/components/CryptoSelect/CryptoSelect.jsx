'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template18/components/LazyImage/LazyImage';
import { useCurrencies } from '@/hooks/useCurrencies';
import { useTranslations } from '@/hooks/useTranslations';

export default function CryptoSelect({
  selectedCurrency,
  onCurrencySelect,
  showAmount = true,
  amount = '',
  onAmountChange = () => {},
  amountLabel = 'amount_idr',
  amountPlaceholder = 'enter_amount',
  showCategories = true,
  showSearch = true,
  className = '',
}) {
  const { t } = useTranslations();
  const [category, setCategory] = useState('stable');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const scrollRef = useRef(null);

  // Use the currencies hook
  const {
    currencies,
    isLoading: loadingCurrencies,
    hasData: hasCurrencies,
    fetchCurrencies,
  } = useCurrencies();

  const categories = [
    { key: 'stable', label: t('stable_coins') },
    { key: 'popular', label: t('popular_coins') },
    { key: 'other', label: t('other_coins_tokens') },
  ];

  // Load currencies on component mount
  useEffect(() => {
    if (!hasCurrencies) {
      fetchCurrencies();
    }
  }, [hasCurrencies, fetchCurrencies]);

  const filteredCoins = useMemo(() => {
    const trimmed = search.trim().toLowerCase();

    // Use the properly categorized currencies from the hook
    let coinsToFilter = [];
    if (category === 'stable') {
      coinsToFilter = currencies.stable || [];
    } else if (category === 'popular') {
      coinsToFilter = currencies.popular || [];
    } else if (category === 'other') {
      coinsToFilter = currencies.other || [];
    }

    return coinsToFilter.filter((c) =>
      trimmed === ''
        ? true
        : c.name.toLowerCase().includes(trimmed) ||
          c.code.toLowerCase().includes(trimmed),
    );
  }, [currencies, category, search]);

  // Get visible coins (chunk of 20)
  const visibleCoins = useMemo(() => {
    return filteredCoins.slice(0, visibleCount);
  }, [filteredCoins, visibleCount]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && visibleCount < filteredCoins.length) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredCoins.length));
    }
  }, [visibleCount, filteredCoins.length]);

  // Reset visible count when category or search changes
  useEffect(() => {
    setVisibleCount(20);
  }, [category, search]);

  return (
    <div className={`space-y-6 ${className}`}>
      {showAmount && (
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label
            htmlFor="crypto-amount"
            className="text-[14px] font-bold whitespace-nowrap text-white md:text-[14px]"
          >
            {t(amountLabel)}
          </label>
          <input
            id="crypto-amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={t(amountPlaceholder)}
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FEA8034D] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#FEA803] focus:ring-0 focus:ring-transparent focus:outline-none sm:w-auto sm:flex-1 sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm lg:h-[55px]"
          />
        </div>
      )}

      {showCategories && (
        <div className="mb-6">
          <div className="rounded-[5px] bg-transparent">
            <div className="flex flex-wrap gap-1 md:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`flex-1 rounded-[4px] border px-4 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:flex-none md:px-6 md:py-2.5 md:text-[14px] ${
                    category === cat.key
                      ? ' bg-[#FFB703] text-[#000000]'
                      : 'border-[#11234D80] bg-transparent text-[white]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[5px] border border-[#11234D] bg-transparent p-4 md:p-5">
        <div className="flex flex-col items-start gap-2 pb-2 sm:flex-row sm:items-center sm:gap-4 md:pb-3">
          <span className="text-[14px] font-bold whitespace-nowrap text-white md:text-[14px]">
            {t('select_coin')}
          </span>
          {showSearch && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_coin')}
              className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFB7034D] bg-[#14213D] px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#FFB703] focus:ring-0 focus:ring-transparent focus:outline-none sm:w-auto sm:flex-1 sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm lg:h-[55px]"
            />
          )}
        </div>
        <div
          ref={scrollRef}
          className="show-scrollbar h-[250px] overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="xs:grid-cols-2 grid grid-cols-1 gap-2 py-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 md:py-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {loadingCurrencies ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <CommonLoader size="lg" border="border-[#CBBC91]" />
              </div>
            ) : visibleCoins.length > 0 ? (
              visibleCoins.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onCurrencySelect(c.code)}
                  className={`group flex min-h-[80px] w-full items-center justify-between gap-3 rounded-[5px] border-2 px-4 py-4 text-[#cfd8df] transition-all duration-300 sm:px-4 ${
                    selectedCurrency === c.code
                      ? 'border-[#11234D80] bg-[#0F50451A]'
                      : 'border-[#11234D80] bg-transparent'
                  } hover:border-[#FFB703] focus:border-[#FFB703] focus:shadow-[inset_0_4px_24px_0_rgba(255,183,3,0.30)]`}
                >
                  <div className="text-left">
                    <div className="text-sm leading-tight text-[#cfd8df] md:text-[14px]">
                      {c.name}
                    </div>
                    <div className="text-[12px] leading-tight text-[#cfd8df] md:text-[12px]">
                      {c.code.includes('(') ? c.code : `(${c.code})`}
                    </div>
                  </div>
                  {c.icon ? (
                    <LazyImage
                      src={c.icon}
                      alt={c.name}
                      height={10}
                      width={10}
                      className="h-8 w-8 shrink-0 rounded-full md:h-10 md:w-10"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-white md:h-10 md:w-10"
                      style={{ backgroundColor: c.color || '#DFA336' }}
                    >
                      {c.code.replace(/[^A-Z]/g, '').slice(0, 2)}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-white">{t('no_currencies_found')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
