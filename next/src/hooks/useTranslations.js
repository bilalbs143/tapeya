'use client';

import { useCallback, useEffect, useState } from 'react';

import { getTemplateConfig } from '@/lib/templateConstants';
import { useLanguage } from '@/providers/LanguageProvider';

// Simple global cache
const translationCache = new Map();

// Request deduplication - prevent multiple simultaneous requests for the same locale
const pendingRequests = new Map();

// Get default language from template config
const templateConfig = getTemplateConfig();
const defaultLanguage = templateConfig.defaultLanguage || 'id';

// Global state to share across all hook instances
let globalTranslations = {};
let globalLoading = false;
let globalCurrentLocale = defaultLanguage;

// Listeners for state changes
const listeners = new Set();

// Notify all listeners of state changes
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// Centralized translation loader with request deduplication
const loadTranslations = async (locale) => {
  // Return cached data immediately if available
  if (translationCache.has(locale)) {
    return translationCache.get(locale);
  }

  // Return existing promise if request is already in progress
  if (pendingRequests.has(locale)) {
    return pendingRequests.get(locale);
  }

  // Create new request
  const cacheBuster = process.env.NEXT_PUBLIC_ASSET_VERSION
    ? `?v=${process.env.NEXT_PUBLIC_ASSET_VERSION}`
    : '';
  const requestPromise = fetch(`/locales/${locale}/common.json${cacheBuster}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      translationCache.set(locale, data);
      return data;
    })
    .catch((error) => {
      console.error('Translation loading failed:', error);
      // Set fallback translations to prevent infinite loading
      const fallbackTranslations = {
        loading_gaming_experience: 'Loading your gaming experience...',
        preparing_casino_experience: 'Preparing your casino experience...',
        lines_pattern: 'Lines Pattern',
        no_content_available: 'No content available',
        // Add more fallback translations as needed
      };
      translationCache.set(locale, fallbackTranslations);
      return fallbackTranslations;
    })
    .finally(() => {
      // Clean up pending request
      pendingRequests.delete(locale);
    });

  // Store the promise to prevent duplicate requests
  pendingRequests.set(locale, requestPromise);

  return requestPromise;
};

// Update global state and notify all listeners
const updateGlobalState = (translations, loading, currentLocale) => {
  globalTranslations = translations;
  globalLoading = loading;
  globalCurrentLocale = currentLocale;
  notifyListeners();
};

export const useTranslations = () => {
  const { currentLocale } = useLanguage();
  const [translations, setTranslations] = useState(globalTranslations);
  const [loading, setLoading] = useState(globalLoading);

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslationsForLocale = async () => {
      // If locale hasn't changed and we have translations, don't reload
      if (
        currentLocale === globalCurrentLocale &&
        Object.keys(globalTranslations).length > 0
      ) {
        setTranslations(globalTranslations);
        setLoading(false);
        return;
      }

      // If we already have cached translations for this locale, use them
      if (translationCache.has(currentLocale)) {
        const cachedTranslations = translationCache.get(currentLocale);
        updateGlobalState(cachedTranslations, false, currentLocale);
        setTranslations(cachedTranslations);
        setLoading(false);
        return;
      }

      // Set loading state globally
      updateGlobalState(globalTranslations, true, currentLocale);
      setLoading(true);

      try {
        const data = await loadTranslations(currentLocale);
        updateGlobalState(data, false, currentLocale);
        setTranslations(data);
        setLoading(false);
      } catch (error) {
        console.error('Translation loading failed:', error);
        updateGlobalState(globalTranslations, false, currentLocale);
        setLoading(false);
      }
    };

    loadTranslationsForLocale();
  }, [currentLocale]);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = () => {
      setTranslations(globalTranslations);
      setLoading(globalLoading);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Translation function with memoization
  const t = useCallback(
    (key, params = {}) => {
      const keys = key.split('.');
      let value = translations;

      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) return key;
      }

      // Handle interpolation
      if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }

      return value || key;
    },
    [translations],
  );

  return { t, loading, currentLocale };
};

// Simple utility to preload all translations
export const preloadAllTranslations = async () => {
  const locales = ['en', 'id', 'ko'];

  try {
    await Promise.all(
      locales.map(async (locale) => {
        if (!translationCache.has(locale)) {
          try {
            await loadTranslations(locale);
          } catch (error) {
            console.warn(
              `Failed to preload translations for ${locale}:`,
              error,
            );
          }
        }
      }),
    );
    console.log('All translations preloaded successfully');
  } catch (error) {
    console.error('Failed to preload translations:', error);
  }
};

// Utility to clear cache (useful for testing)
export const clearTranslationCache = () => {
  translationCache.clear();
  pendingRequests.clear();
  globalTranslations = {};
  globalLoading = false;
  notifyListeners();
};
