/**
 * Template Layout Resolver System
 * Provides robust template-based layout routing with optimizations
 */

import { DEFAULT_TEMPLATE, isValidTemplate } from './templateConstants';

// Cache template name to avoid repeated env lookups
let templateName = null;

// Get current template from environment (cached)
export function getCurrentTemplate() {
  if (templateName === null) {
    const envTemplate = process.env.NEXT_PUBLIC_TEMPLATE;
    templateName =
      envTemplate && isValidTemplate(envTemplate)
        ? envTemplate
        : DEFAULT_TEMPLATE;
  }
  return templateName;
}

// Export cached template name for consistency
export function getCurrentTemplateName() {
  return getCurrentTemplate();
}
