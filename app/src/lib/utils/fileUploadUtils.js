/**
 * FileUploadValue helpers.
 *
 * Value shape: { files: File[], existingUrls: string[] }
 *
 *   Create flow:  { files: [file], existingUrls: [] }
 *   Edit flow:    { files: [], existingUrls: ['https://…'] }
 *   Empty / unset: { files: [], existingUrls: [] }
 */

/** Canonical empty value — use as defaultValues in RHF. */
export const EMPTY_FILE_UPLOAD = { files: [], existingUrls: [] };

/**
 * Normalise any raw value (undefined, null, partial object) to a full FileUploadValue.
 * Safe to call unconditionally.
 *
 * @param {unknown} value
 * @returns {{ files: File[], existingUrls: string[] }}
 */
export function normaliseFileUploadValue(value) {
  if (value == null || typeof value !== 'object') return { files: [], existingUrls: [] };
  return {
    files: Array.isArray(value.files) ? value.files : [],
    existingUrls: Array.isArray(value.existingUrls) ? value.existingUrls : [],
  };
}

/**
 * Seed an edit-flow value from a URL stored on the server.
 *
 * @param {string | null | undefined} url
 * @returns {{ files: File[], existingUrls: string[] }}
 */
export function fileUploadValueFromUrl(url) {
  return { files: [], existingUrls: url ? [url] : [] };
}

/**
 * Seed an edit-flow value from multiple server URLs.
 *
 * @param {string[]} urls
 * @returns {{ files: File[], existingUrls: string[] }}
 */
export function fileUploadValueFromUrls(urls) {
  return { files: [], existingUrls: Array.isArray(urls) ? urls : [] };
}

/**
 * Append new file(s) from a FileUploadValue to a FormData object.
 * Single file → `fieldName`; multiple → `fieldName[]` (Laravel convention).
 *
 * @param {FormData} fd
 * @param {string} fieldName
 * @param {{ files: File[], existingUrls: string[] } | null | undefined} value
 */
export function appendFileUploadToFormData(fd, fieldName, value) {
  const { files = [] } = normaliseFileUploadValue(value);
  if (files.length === 0) return;
  if (files.length === 1) {
    fd.append(fieldName, files[0]);
  } else {
    files.forEach((f) => fd.append(`${fieldName}[]`, f));
  }
}

/**
 * Returns true when the value contains at least one file or URL.
 *
 * @param {{ files: File[], existingUrls: string[] } | null | undefined} value
 */
export function fileUploadHasContent(value) {
  const { files, existingUrls } = normaliseFileUploadValue(value);
  return files.length > 0 || existingUrls.length > 0;
}

// ── Type helpers ──────────────────────────────────────────────────────────────

const IMAGE_MIME_RE = /^image\//i;
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;

/** Whether a File object is an image (by MIME type). */
export function isImageFile(file) {
  return IMAGE_MIME_RE.test(file?.type ?? '');
}

/** Whether a URL points to an image (by extension). */
export function isImageUrl(url) {
  // Strip query/hash before testing extension
  try {
    const pathname = new URL(url).pathname;
    return IMAGE_EXT_RE.test(pathname);
  } catch {
    return IMAGE_EXT_RE.test(url ?? '');
  }
}
