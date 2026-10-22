import type { MutableRefObject } from 'react';

/** Shared exclusive lock for store-ball / undo so they never overlap. */

export function tryBeginSave(savingRef: MutableRefObject<boolean>): boolean {
  if (savingRef.current) return false;
  savingRef.current = true;
  return true;
}

export function endSave(savingRef: MutableRefObject<boolean>): void {
  savingRef.current = false;
}
