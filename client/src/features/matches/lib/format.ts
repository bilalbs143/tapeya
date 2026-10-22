import { cn } from '@/shared/lib/cn';

/** Date helpers for My Matches rows — calendar stack + meta lines. */

export function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const iso = Date.parse(raw);
  if (!Number.isNaN(iso)) return new Date(iso);
  return null;
}

export function dateParts(raw: string | null | undefined): { mon: string; day: string } {
  const d = parseDate(raw);
  if (!d) return { mon: '—', day: '—' };
  return {
    mon: d.toLocaleString('en-GB', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
  };
}

export function timeOf(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/am|pm/i.test(raw) || /^\d{1,2}:\d{2}/.test(raw)) return raw;
  const d = parseDate(raw);
  if (!d) return null;
  return d.toLocaleString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function shortDate(raw: string | null | undefined): string | null {
  const d = parseDate(raw);
  if (!d) return raw ? String(raw) : null;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase().replace(',', '');
}

export function sectionLabelClass(section: 'live' | 'toss' | 'scheduled' | 'done'): string {
  return cn(
    'font-mono text-4xs font-bold tracking-eyebrow uppercase',
    section === 'live' ? 'text-positive' : 'text-dim'
  );
}
