import { RESEND_SECONDS } from './constants';

const COOLDOWN_KEY = 'tapeya:otp-cooldown';

type CooldownPayload = { phone: string; until: number };

function read(): CooldownPayload | null {
  try {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    return raw ? (JSON.parse(raw) as CooldownPayload) : null;
  } catch {
    return null;
  }
}

function write(value: CooldownPayload): void {
  try {
    window.localStorage.setItem(COOLDOWN_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Absolute deadline so a refresh cannot hand out a fresh 60s. */
export function startCooldown(phone: string, seconds = RESEND_SECONDS): void {
  write({ phone, until: Date.now() + seconds * 1000 });
}

export function cooldownRemaining(phone: string): number {
  const c = read();
  if (!c || c.phone !== phone) return 0;
  return Math.max(0, Math.ceil((c.until - Date.now()) / 1000));
}

export function formatCooldown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
