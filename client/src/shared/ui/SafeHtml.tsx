import { cn } from '@/shared/lib/cn';
import { sanitizeHtml, type SanitizeHtmlProfile } from '@/shared/lib/sanitizeHtml';

export type SafeHtmlProps = {
  html: string | null | undefined;
  profile: SanitizeHtmlProfile;
  /** Shown when sanitize yields empty (optional). */
  emptyFallback?: string | undefined;
  as?: 'div' | 'article' | 'section' | undefined;
  className?: string | undefined;
};

/**
 * Renders API/CMS HTML after DOMPurify. Only approved sink for `dangerouslySetInnerHTML`.
 */
export function SafeHtml({ html, profile, emptyFallback, as = 'div', className }: SafeHtmlProps) {
  const clean = sanitizeHtml(html, profile);
  const markup = clean || (emptyFallback ? sanitizeHtml(emptyFallback, profile) : '');
  if (!markup) return null;

  const Tag = as;
  return <Tag className={cn(className)} dangerouslySetInnerHTML={{ __html: markup }} />;
}
