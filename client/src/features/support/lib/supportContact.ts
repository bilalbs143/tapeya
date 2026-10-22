export function waMeHref(phone: string | null | undefined, text?: string | undefined): string {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (text?.trim()) {
    return `https://wa.me/${digits}?text=${encodeURIComponent(text.trim())}`;
  }
  return `https://wa.me/${digits}`;
}

export function supportPhoneFromSettings(settings: Array<{ key: string; value: string }> | undefined): string | null {
  const row = settings?.find((s) => s.key === 'support_phone');
  const phone = row?.value?.trim();
  return phone || null;
}

const ATTACH_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'] as const;

const ATTACH_MAX_MB = 5;

export function checkSupportAttachment(file: File): string | null {
  if (!(ATTACH_TYPES as readonly string[]).includes(file.type)) {
    return 'Use JPG, PNG, GIF, WebP or PDF.';
  }
  if (file.size > ATTACH_MAX_MB * 1024 * 1024) {
    return `File must be under ${ATTACH_MAX_MB} MB.`;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { ATTACH_MAX_MB, ATTACH_TYPES };
