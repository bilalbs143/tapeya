import DOMPurify, { type Config } from 'dompurify';

/** Rich-text profiles for API/CMS HTML rendered via `SafeHtml`. */
export type SanitizeHtmlProfile = 'cms' | 'product';

const SHARED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a', 'blockquote', 'span'];

/** Legal / static CMS pages — headings allowed for long-form policy copy. */
const CMS_TAGS = [...SHARED_TAGS, 'h1', 'h2', 'h3', 'h4'];

/** Product descriptions from sellers/admin — no top-level page headings. */
const PRODUCT_TAGS = [...SHARED_TAGS, 'h3', 'h4'];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class'];

const PROFILE_CONFIG: Record<SanitizeHtmlProfile, Config> = {
  cms: {
    ALLOWED_TAGS: CMS_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  },
  product: {
    ALLOWED_TAGS: PRODUCT_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  },
};

let hooksInstalled = false;

/** Ensure external links cannot use `window.opener` after sanitize. */
function ensureLinkHooks(): void {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof HTMLAnchorElement)) return;

    const href = node.getAttribute('href');
    if (!href) {
      node.removeAttribute('href');
      return;
    }

    // DOMPurify already drops javascript:/data: for href; keep http(s) + mailto + relative.
    const lower = href.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
      node.removeAttribute('href');
      return;
    }

    if (node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Strip CMS chrome that duplicates the app ScreenBar (outer article + leading h1).
 * Runs before DOMPurify so allowed `<h1>` elsewhere in the body still works.
 */
export function stripCmsChrome(html: string): string {
  let out = html.trim();
  if (!out) return '';

  out = out.replace(/^<article[^>]*>/i, '').replace(/<\/article>\s*$/i, '');
  out = out.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  return out.trim();
}

/**
 * Sanitize untrusted HTML from CMS / product APIs before `dangerouslySetInnerHTML`.
 * Empty input returns `''` — callers decide empty-state copy.
 */
export function sanitizeHtml(html: string | null | undefined, profile: SanitizeHtmlProfile): string {
  if (typeof html !== 'string' || !html.trim()) return '';

  ensureLinkHooks();

  const prepared = profile === 'cms' ? stripCmsChrome(html) : html.trim();
  if (!prepared) return '';

  return DOMPurify.sanitize(prepared, PROFILE_CONFIG[profile]);
}
