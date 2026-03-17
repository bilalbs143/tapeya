/**
 * useDebounce
 *
 * Returns a value that updates only after the source has been stable for delayMs.
 * Use for search inputs, filters, etc. Coding guidelines: docs/Coding guidelines.md (§10)
 *
 * @param {T} value - Value to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {T} Debounced value
 */
import { useEffect, useState } from 'react';

export function useDebounce(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debouncedValue;
}
