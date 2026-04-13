/**
 * Persists dev/QA OTP preview across navigations. React Router `location.state`
 * is often empty on iOS Safari / WebView after bfcache or certain transitions,
 * so we mirror otp in sessionStorage when the API returns it.
 */
const KEY = 'tapeya_otp_preview';
const TTL_MS = 15 * 60 * 1000;

function phoneKey(phone) {
  return String(phone ?? '').replace(/\D/g, '');
}

export function setOtpPreview(phone, otp) {
  if (!phone || otp == null || otp === '') return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        phoneKey: phoneKey(phone),
        otp: String(otp),
        at: Date.now(),
      }),
    );
  } catch {
    // private mode / quota
  }
}

export function getOtpPreview(phone) {
  if (!phone) return null;
  const want = phoneKey(phone);
  if (!want) return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o.phoneKey !== want) return null;
    if (Date.now() - o.at > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return o.otp ?? null;
  } catch {
    return null;
  }
}

export function clearOtpPreview() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Normalize RTK unwrap / API body shapes for OTP in JSON. */
export function extractOtpFromAuthResponse(result) {
  if (!result || typeof result !== 'object') return null;
  const inner = result.data;
  if (inner && typeof inner === 'object' && inner.otp != null) {
    return String(inner.otp);
  }
  if (result.otp != null) return String(result.otp);
  return null;
}
