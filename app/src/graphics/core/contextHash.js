/**
 * Fast deterministic hash of session context for processor memoization.
 *
 * @param {Record<string, unknown>|null|undefined} context
 * @returns {string}
 */
export function hashGraphicContext(context) {
  const serialized = JSON.stringify(context ?? {});
  let hash = 5381;

  for (let i = 0; i < serialized.length; i += 1) {
    hash = (hash * 33) ^ serialized.charCodeAt(i);
  }

  return (hash >>> 0).toString(16);
}
