/** YYYY-MM-DD from an ISO datetime (local calendar day of the instant). */
export function isoDateHead(iso: string | null | undefined): string {
  if (!iso) return '';
  const head = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** HH:mm local from an ISO datetime — matches legacy `formatIsoTimeForDisplay`. */
export function isoTimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * DatePicker (YYYY-MM-DD) + time (HH:mm) → API `YYYY-MM-DDTHH:mm` (UTC slice),
 * same as legacy `toApiDateTime`.
 */
export function toApiDateTime(date: string, time: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return undefined;
  if (!/^\d{2}:\d{2}$/.test(time.trim())) return undefined;
  const dateParts = date.split('-').map(Number);
  const timeParts = time.split(':').map(Number);
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  const hours = timeParts[0];
  const minutes = timeParts[1];
  if (year == null || month == null || day == null || hours == null || minutes == null) return undefined;
  const local = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(local.getTime())) return undefined;
  return local.toISOString().slice(0, 16);
}
