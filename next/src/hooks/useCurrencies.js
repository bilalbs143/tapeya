'use client';

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCurrencies } from '@/website/websiteAction';

export const useCurrencies = () => {
  const dispatch = useDispatch();
  const currenciesLoader = useSelector(
    (state) => state.website.currenciesLoader,
  );
  const rawCurrenciesData = useSelector(
    (state) => state.website.currenciesData,
  );
  const fetchCurrenciesData = useCallback(async () => {
    try {
      await dispatch(fetchCurrencies()).unwrap();
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  }, [dispatch]);

  // Map the raw API response to the expected structure
  const currenciesData = useMemo(() => {
    if (!rawCurrenciesData || !rawCurrenciesData.currencies) {
      return {
        popular: [],
        stable: [],
        other: [],
        allCurrencies: [],
      };
    }

    return {
      // New categories
      popular: rawCurrenciesData.currencies?.popular || [],
      stable: rawCurrenciesData.currencies?.stable || [],
      other: rawCurrenciesData.currencies?.other || [],
      allCurrencies: rawCurrenciesData.all_currencies || [],
    };
  }, [rawCurrenciesData]);

  const getAllCurrencies = useCallback(() => {
    const { popular, stable, other } = currenciesData;
    return [...popular, ...stable, ...other];
  }, [currenciesData]);

  return {
    currencies: currenciesData,
    allCurrencies: getAllCurrencies(),
    isLoading: currenciesLoader,
    hasData:
      currenciesData.popular.length > 0 ||
      currenciesData.stable.length > 0 ||
      currenciesData.other.length > 0,
    error: null,
    fetchCurrencies: fetchCurrenciesData,
  };
};
