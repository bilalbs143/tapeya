import { getTemplateConfig } from './src/lib/templateConstants.js';

// Get default language from template config
const templateConfig = getTemplateConfig();
const defaultLocale = templateConfig.defaultLanguage || 'id';

export const translationConfig = {
  defaultLocale: defaultLocale,
  locales: ['en', 'id', 'ko', 'jp', 'my', 'th', 'tw', 'vn'],
};

export default translationConfig;
