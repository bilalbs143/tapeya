import { describe, expect, it } from 'vitest';

import { quickMatchInitials, quickMatchSetupStatus } from './quickMatchForm';
import type { QuickMatchGate } from './quickMatchPayload';

const readyGate: QuickMatchGate = { canSave: true, canToss: true, note: null };
const shortGate: QuickMatchGate = {
  canSave: true,
  canToss: false,
  note: 'Side B is two short of eleven. Toss needs a full side — save now and add the rest before you start.',
};
const nameGate: QuickMatchGate = {
  canSave: false,
  canToss: false,
  note: 'Name both sides, then add players.',
};

describe('quickMatchForm', () => {
  it('reports both sides ready when toss is unlocked', () => {
    expect(quickMatchSetupStatus(readyGate, 'Aces', 'Blues', 11, 11, 11)).toEqual({
      alert: false,
      text: '22 of 22 players added — both sides are ready.',
    });
  });

  it('names the shorter side when the gate note says short of', () => {
    expect(quickMatchSetupStatus(shortGate, 'Aces', 'Blues', 11, 9, 11)).toEqual({
      alert: false,
      text: '20 of 22 players added — Blues needs 2 more.',
    });
  });

  it('alerts when sides still need names', () => {
    expect(quickMatchSetupStatus(nameGate, '', '', 0, 0, 11).alert).toBe(true);
  });

  it('builds crest initials', () => {
    expect(quickMatchInitials('Ali Khan', 'A')).toBe('AK');
    expect(quickMatchInitials('Ali', 'A')).toBe('AL');
    expect(quickMatchInitials('  ', 'B')).toBe('B');
  });
});
