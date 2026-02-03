'use client';

import { useMemo } from 'react';

import { getTemplateConfig, TEMPLATE_NAMES } from '@/lib/templateConstants';

/**
 * Custom hook to get current template configuration
 * @returns {object} Template configuration object
 */
export const useTemplate = () => {
  const templateConfig = useMemo(() => {
    // Get current template based on environment or default to template1
    const currentTemplate =
      process.env.NEXT_PUBLIC_TEMPLATE || TEMPLATE_NAMES.TEMPLATE1;
    return getTemplateConfig(currentTemplate);
  }, []);

  return {
    ...templateConfig,
    getCurrency: () => templateConfig.currency,
    getProductName: () => templateConfig.productName,
    getName: () => templateConfig.name,
    getTitle: () => templateConfig.title,
    getDescription: () => templateConfig.description,
    getFavicon: () => templateConfig.favicon,
    getHeaderLogo: () => templateConfig.headerLogo,
    getFooterLogo: () => templateConfig.footerLogo,
    getManifest: () => templateConfig.manifest,
    getNotificationSounds: () => templateConfig.notificationSounds,
    getDefaultLanguage: () => templateConfig.defaultLanguage,
  };
};
