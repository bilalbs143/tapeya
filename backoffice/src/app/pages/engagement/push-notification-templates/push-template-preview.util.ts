/**
 * Mirrors backend NotificationTemplateRenderer — {{variable}} substitution for live preview.
 */
export function renderPushTemplate(template: string, data: Record<string, string>): string {
  if (!template) {
    return '';
  }

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => (data[key] != null ? String(data[key]) : ''));
}
