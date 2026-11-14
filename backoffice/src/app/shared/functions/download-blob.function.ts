/**
 * Trigger a browser file download from a Blob (CSV / Excel / etc.).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Parse `Content-Disposition` filename, including RFC 5987 `filename*`. */
export function filenameFromContentDisposition(header: string | null | undefined, fallback: string): string {
  if (!header) return fallback;

  const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim().replace(/^"|"$/g, ''));
    } catch {
      // fall through
    }
  }

  const plain = /filename\s*=\s*("?)([^";]+)\1/i.exec(header);
  if (plain?.[2]) {
    return plain[2].trim();
  }

  return fallback;
}
