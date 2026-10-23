function toNumericSegments(version: string): number[] | null {
  const s = String(version ?? '')
    .trim()
    .replace(/^v/i, '');
  if (!s || !/^\d/.test(s)) {
    return null;
  }
  return s.split('.').map((part) => {
    const m = /^(\d+)/.exec(part);
    const digits = m?.[1];
    return digits === undefined ? 0 : parseInt(digits, 10);
  });
}

/** Compare dotted versions (`1.2.3`). Returns null when either side is not numeric. */
export function compareDotVersions(a: string, b: string): -1 | 0 | 1 | null {
  const sa = toNumericSegments(a);
  const sb = toNumericSegments(b);
  if (!sa || !sb) {
    return null;
  }
  const len = Math.max(sa.length, sb.length);
  for (let i = 0; i < len; i += 1) {
    const da = sa[i] ?? 0;
    const db = sb[i] ?? 0;
    if (da < db) return -1;
    if (da > db) return 1;
  }
  return 0;
}

/** True when the installed build is behind the public system-settings store version. */
export function shouldPromptAppUpdate(installedVersion: string, configuredVersion: string): boolean {
  const installed = String(installedVersion ?? '').trim();
  const configured = String(configuredVersion ?? '').trim();
  if (!installed || !configured) {
    return false;
  }
  const cmp = compareDotVersions(installed, configured);
  if (cmp !== null) {
    return cmp < 0;
  }
  const ni = installed.replace(/^v/i, '').toLowerCase();
  const nc = configured.replace(/^v/i, '').toLowerCase();
  return ni !== nc;
}
