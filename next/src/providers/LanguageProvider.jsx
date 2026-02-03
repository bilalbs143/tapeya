'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { getTemplateConfig } from '@/lib/templateConstants';
import { updateUserProfile } from '@/slices/auth/authAction';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuth, user, profileLoader } = useSelector((state) => state.auth);

  // Get default language from template config
  const templateConfig = getTemplateConfig();
  const defaultLanguage = templateConfig.defaultLanguage || 'id';

  // Initialize from localStorage if available, otherwise use default
  const [currentLocale, setCurrentLocale] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale');
      const validLocales = ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'];
      if (savedLocale && validLocales.includes(savedLocale)) {
        return savedLocale;
      }
    }
    // Get default from template config
    const config = getTemplateConfig();
    return config.defaultLanguage || 'id';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred-locale');
    const validLocales = ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'];

    if (savedLocale && validLocales.includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    } else {
      // No saved locale, use template default language
      setCurrentLocale(defaultLanguage);
      localStorage.setItem('preferred-locale', defaultLanguage);
    }
    setIsLoading(false);
  }, []); // Only run once on mount

  // Listen for locale reset event (when cache is cleared)
  useEffect(() => {
    const handleLocaleReset = (event) => {
      const { locale } = event.detail;
      const validLocales = ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'];
      if (locale && validLocales.includes(locale)) {
        setCurrentLocale(locale);
        localStorage.setItem('preferred-locale', locale);
      }
    };

    window.addEventListener('locale-reset', handleLocaleReset);
    return () => {
      window.removeEventListener('locale-reset', handleLocaleReset);
    };
  }, []);

  // After login, prefer user's previously selected locale (localStorage).
  // If it differs from the server's user.locale, update backend to match selection.
  useEffect(() => {
    if (!isAuth) return;

    const savedLocale = localStorage.getItem('preferred-locale');
    const validLocales = ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'];
    const hasSaved = savedLocale && validLocales.includes(savedLocale);
    const serverLocale = user?.locale;
    const hasServer = serverLocale && validLocales.includes(serverLocale);

    if (hasSaved) {
      // Keep user's selection and sync backend if different
      setCurrentLocale(savedLocale);
      localStorage.setItem('preferred-locale', savedLocale);
      if (hasServer && serverLocale !== savedLocale) {
        // Fire-and-forget update to persist preference
        dispatch(updateUserProfile({ locale: savedLocale }));
      }
    } else if (hasServer) {
      // No saved preference; adopt server and persist locally
      setCurrentLocale(serverLocale);
      localStorage.setItem('preferred-locale', serverLocale);
    }
  }, [isAuth, user?.locale, dispatch]);

  const switchLanguage = useCallback(
    async (newLocale) => {
      if (
        ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'].includes(newLocale)
      ) {
        setCurrentLocale(newLocale);
        localStorage.setItem('preferred-locale', newLocale);

        // If user is authenticated, save to backend
        if (isAuth) {
          try {
            await dispatch(updateUserProfile({ locale: newLocale })).unwrap();
          } catch (error) {
            console.error(
              'Failed to save language preference to backend:',
              error,
            );
            const errorMessage =
              error?.message || 'Failed to save language preference';
            toast.error(errorMessage);
          }
        }
      }
    },
    [isAuth, dispatch],
  );

  // Memoize the value object to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      currentLocale,
      switchLanguage,
      isLoading: isLoading || profileLoader,
      locales: ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'],
      localeNames: {
        en: 'English',
        id: 'Indonesian',
        ko: '한국어',
        jp: '日本語',
        my: 'Melayu',
        th: 'ไทย',
        tw: '繁體中文',
        vn: 'Tiếng Việt',
      },
      isSavingToBackend: profileLoader,
    }),
    [currentLocale, switchLanguage, isLoading, profileLoader],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
