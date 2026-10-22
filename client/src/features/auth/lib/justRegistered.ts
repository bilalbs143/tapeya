const JUST_REGISTERED_KEY = 'tapeya:just-registered';

export function markJustRegistered(phone: string): void {
  try {
    window.localStorage.setItem(JUST_REGISTERED_KEY, JSON.stringify({ phone }));
  } catch {
    /* ignore */
  }
}

/** True once, for the phone that registered on THIS device. Consumes the flag — a returning login must never inherit the prompt. */
export function consumeJustRegistered(phone: string): boolean {
  try {
    const raw = window.localStorage.getItem(JUST_REGISTERED_KEY);
    if (!raw) return false;
    const flag = JSON.parse(raw) as { phone?: string };
    if (flag.phone !== phone) return false;
    window.localStorage.removeItem(JUST_REGISTERED_KEY);
    return true;
  } catch {
    return false;
  }
}
