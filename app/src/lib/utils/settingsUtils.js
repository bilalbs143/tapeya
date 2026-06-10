export function mapSystemSettingsByKey(rows) {
  const out = {};
  if (!Array.isArray(rows)) {
    return out;
  }
  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      continue;
    }
    const rawKey = row.key;
    const key = typeof rawKey === 'string' ? rawKey : (rawKey?.value ?? rawKey?.name);
    if (typeof key !== 'string' || !key) {
      continue;
    }
    const v = row.value;
    out[key] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}
