'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage.jsx';
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

  // Filter categories to only show those with currencies
  const categories = useMemo(() => {
    return [
      { key: 'stable', label: t('stable_coins') },
      { key: 'popular', label: t('popular_coins') },
      { key: 'other', label: t('other_coins_tokens') },
    ].filter((cat) => (currencies[cat.key] || []).length > 0);
  }, [currencies, t]);

  // Load currencies on component mount
  useEffect(() => {
    if (!hasCurrencies) {
      fetchCurrencies();
    }
  }, [hasCurrencies, fetchCurrencies]);

  // Auto-select first available category if current is empty
  useEffect(() => {
    if (categories.length > 0 && !currencies[category]?.length) {
      setCategory(categories[0].key);
    }
  }, [categories, category, currencies]);

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
            className="relative block h-[46px] w-full appearance-none rounded-[12px] border border-[#5343B1] px-3 py-3 text-white placeholder:!text-xs placeholder:text-[#B3A6FF] focus:z-10 focus:border-[#FC7E09] focus:ring-1 focus:ring-[#FC7E09] focus:outline-none sm:flex-1 sm:text-sm md:placeholder:!text-sm"
          />
        </div>
      )}

      {showCategories && (
        <div className="mb-[10px] flex w-full flex-wrap gap-1 md:gap-2">
          {categories.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setCategory(t.key)}
              className={`flex-1 basis-1/3 rounded-[4px] border border-[#5343B1] px-4 py-2 text-center text-[12px] font-bold transition-all duration-300 md:flex-none md:basis-auto md:px-6 md:text-[14px] ${
                category === t.key
                  ? 'bg-[#FC7E09] text-white'
                  : 'bg-[#261A66] text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-t-md bg-[#261A66] p-4 md:p-5">
        <div className="flex flex-col items-start gap-2 pb-2 sm:flex-row sm:items-center sm:gap-4 md:pb-3">
          <span className="text-[14px] font-bold whitespace-nowrap text-white md:text-[14px]">
            {t('select_coin')}
          </span>
          {showSearch && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_coin')}
              className="relative block h-[46px] w-full appearance-none rounded-[12px] border border-[#5343B1] px-3 py-3 text-white placeholder:!text-xs placeholder:text-[#B3A6FF] focus:z-10 focus:border-[#FC7E09] focus:ring-1 focus:ring-[#FC7E09] focus:outline-none sm:flex-1 sm:text-sm md:placeholder:!text-sm"
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
                <CommonLoader size="lg" border="border-[#FC7E09]" />
              </div>
            ) : visibleCoins.length > 0 ? (
              visibleCoins.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onCurrencySelect(c.code)}
                  className={`group flex min-h-[80px] w-full items-center justify-between gap-3 rounded-[12px] border px-3 py-3 transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] sm:px-4 ${
                    selectedCurrency === c.code
                      ? 'border-[#FC7E09] bg-[#302377] shadow-[0_0_10px_0_#FC7E09_inset]'
                      : 'border-[#5343B1] bg-[#302377]'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm leading-tight text-[#B3A6FF] md:text-[14px]">
                      {c.name}
                    </div>
                    <div className="text-[12px] leading-tight text-[#B3A6FF] md:text-[12px]">
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
                      style={{ backgroundColor: c.color || '#5343B1' }}
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
