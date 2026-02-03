// Server-side template configuration (no 'use client' directive)
import { DEFAULT_TEMPLATE, getTemplateConfig } from './templateConstants';

// Cache resolved config to avoid repeated lookups (skip cache in dev so config changes apply)
let configCache = null;

export function getServerTemplateConfig() {
  const isDev = process.env.NODE_ENV === 'development';
  if (configCache && !isDev) {
    return configCache;
  }

  const templateName = process.env.NEXT_PUBLIC_TEMPLATE || DEFAULT_TEMPLATE;
  const config = getTemplateConfig(templateName);
  if (!isDev) {
    configCache = config;
  }
  return config;
}
