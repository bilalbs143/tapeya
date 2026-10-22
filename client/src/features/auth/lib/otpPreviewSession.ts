/** SessionStorage OTP preview — router state often drops on iOS/Cap after bfcache. */
const KEY = 'tapeya_otp_preview';
const TTL_MS = 15 * 60 * 1000;

export type OtpPreview = {
  phone: string;
  otp: string;
};

function phoneKey(phone: string): string {
  return String(phone ?? '').replace(/\D/g, '');
}

export function setOtpPreview(phone: string, otp: string): void {
  if (!phone || otp == null || otp === '') return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        phoneKey: phoneKey(phone),
        phone,
        otp: String(otp),
        at: Date.now(),
      })
    );
  } catch {
    // private mode / quota
  }
}

export function getOtpPreview(phone: string): string | null {
  const session = readPreview();
  if (!session) return null;
  if (session.phoneKey !== phoneKey(phone)) return null;
  return session.otp;
}

/** Recover phone when router state was dropped (iOS / Cap). */
export function getOtpPreviewSession(): OtpPreview | null {
  const session = readPreview();
  if (!session?.phone || !session.otp) return null;
  return { phone: session.phone, otp: session.otp };
}

export function clearOtpPreview(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

function readPreview(): { phoneKey: string; phone?: string; otp: string; at: number } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as {
      phoneKey?: string;
      phone?: string;
      otp?: string;
      at?: number;
    };
    if (!o.phoneKey || o.otp == null || o.at == null) return null;
    if (Date.now() - o.at > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return {
      phoneKey: o.phoneKey,
      ...(o.phone ? { phone: o.phone } : {}),
      otp: String(o.otp),
      at: o.at,
    };
  } catch {
    return null;
  }
}
