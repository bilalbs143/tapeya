/**
 * Normalizes official names from live payload or fixture shapes.
 *
 * @param {object} data
 */
export function resolveOfficialNames(data) {
  if (!data) return [];

  if (Array.isArray(data.names) && data.names.length > 0) {
    return data.names.map((name) => String(name).trim()).filter(Boolean);
  }

  const raw = data.text ?? data.body ?? data.message ?? '';
  if (!raw) return [];

  if (typeof raw === 'string' && raw.includes('\n')) {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (typeof raw === 'string' && raw.includes('|')) {
    return raw
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  if (typeof raw === 'string' && raw.includes(',')) {
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [String(raw).trim()].filter(Boolean);
}
