import { useMemo } from 'react';

import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';

function rowKey(row) {
  if (!row?.key) return '';
  return typeof row.key === 'string' ? row.key : String(row.key);
}

function waMeHref(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export function useSupportWhatsAppContact() {
  const { data: settings = [] } = useGetPublicSystemSettingsQuery();

  return useMemo(() => {
    const row = settings.find((s) => rowKey(s) === 'support_phone');
    const phone = typeof row?.value === 'string' ? row.value.trim() : '';
    const href = phone ? waMeHref(phone) : '';

    return {
      hasWhatsApp: Boolean(phone && href),
      whatsAppDisplay: phone,
      whatsAppHref: href,
    };
  }, [settings]);
}
