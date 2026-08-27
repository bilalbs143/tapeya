const MAX_LINES = 48;

/** @type {string[]} */
let lines = [];

/** @type {Set<(lines: string[]) => void>} */
const listeners = new Set();

function formatPayload(payload) {
  if (payload === undefined) {
    return '';
  }
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return text.length > 420 ? `${text.slice(0, 420)}…` : text;
  } catch {
    return String(payload);
  }
}

/**
 * @param {string} scope
 * @param {unknown} [payload]
 */
export function appendStreamDebugLine(scope, payload) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const detail = formatPayload(payload);
  const line = detail ? `${time} ${scope} ${detail}` : `${time} ${scope}`;
  lines = [...lines.slice(-(MAX_LINES - 1)), line];
  listeners.forEach((listener) => listener(lines));
}

export function clearStreamDebugLines() {
  lines = [];
  listeners.forEach((listener) => listener(lines));
}

export function getStreamDebugLinesText() {
  return lines.join('\n');
}

/** @param {(lines: string[]) => void} listener */
export function subscribeStreamDebugLines(listener) {
  listeners.add(listener);
  listener(lines);
  return () => {
    listeners.delete(listener);
  };
}
