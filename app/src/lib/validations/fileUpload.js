/**
 * React Hook Form validation helpers for FileUploadField.
 *
 * Usage:
 *   rules={{ validate: fileUploadRequired }}
 *   rules={{ validate: { required: fileUploadRequired, size: fileUploadMaxSizeMb(5) } }}
 */

import { normaliseFileUploadValue } from '@/lib/utils/fileUploadUtils';

/**
 * Field is required — at least one file or URL must be present.
 *
 * @param {unknown} value
 * @returns {true | string}
 */
export function fileUploadRequired(value) {
  const { files, existingUrls } = normaliseFileUploadValue(value);
  if (!files.length && !existingUrls.length) return 'This file is required.';
  return true;
}

/**
 * Factory: validate total new-file count.
 *
 * @param {number} max
 * @returns {(value: unknown) => true | string}
 */
export function fileUploadMaxFiles(max) {
  return (value) => {
    const { files } = normaliseFileUploadValue(value);
    if (files.length > max) return `Maximum ${max} file${max === 1 ? '' : 's'} allowed.`;
    return true;
  };
}

/**
 * Factory: validate every new file is under the given MB limit.
 *
 * @param {number} maxMb
 * @returns {(value: unknown) => true | string}
 */
export function fileUploadMaxSizeMb(maxMb) {
  return (value) => {
    const { files } = normaliseFileUploadValue(value);
    const maxBytes = maxMb * 1024 * 1024;
    const oversized = files.find((f) => f.size > maxBytes);
    if (oversized) return `"${oversized.name}" exceeds ${maxMb} MB.`;
    return true;
  };
}
