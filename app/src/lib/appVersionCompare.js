function toNumericSegments(version) {
  const s = String(version ?? '')
    .trim()
    .replace(/^v/i, '');
  if (!s || !/^\d/.test(s)) {
    return null;
  }
  return s.split('.').map((part) => {
    const m = /^(\d+)/.exec(part);
    return m ? parseInt(m[1], 10) : 0;
  });
}

export function compareDotVersions(a, b) {
  const sa = toNumericSegments(a);
  const sb = toNumericSegments(b);
  if (!sa || !sb) {
    return null;
  }
  const len = Math.max(sa.length, sb.length);
  for (let i = 0; i < len; i += 1) {
    const da = sa[i] ?? 0;
    const db = sb[i] ?? 0;
    if (da < db) {
      return -1;
    }
    if (da > db) {
      return 1;
    }
  }
  return 0;
}

export function shouldPromptAppUpdate(installedVersion, configuredVersion) {
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
