import { describe, expect, it } from 'vitest';

import { buildQuickMatchPayload, playerError, type QuickMatchDraft, quickMatchGate } from './quickMatchPayload';

function draft(over: Partial<QuickMatchDraft> = {}): QuickMatchDraft {
  return {
    cricketFormat: 'tape_ball',
    overs: 10,
    playersPerSide: 2,
    homeName: 'City Blues',
    awayName: 'Karachi Kings',
    homePlayers: [
      { name: 'Ali Khan', phone: '+923001234567' },
      { userId: 9, name: 'Omar' },
    ],
    awayPlayers: [
      { name: 'Sara Noor', phone: '+923009876543' },
      { userId: 4, name: 'Hina' },
    ],
    ...over,
  };
}

describe('quickMatchGate', () => {
  it('allows toss only when both sides match players per side', () => {
    expect(quickMatchGate(draft())).toEqual({ canSave: true, canToss: true, note: null });
    const short = quickMatchGate(draft({ awayPlayers: [{ name: 'Sara Noor', phone: '+923009876543' }] }));
    expect(short.canToss).toBe(false);
    expect(short.canSave).toBe(true);
    expect(short.note).toMatch(/short of two/i);
  });

  it('refuses a player on both sides', () => {
    const gate = quickMatchGate(
      draft({
        awayPlayers: [
          { userId: 9, name: 'Omar' },
          { name: 'Sara Noor', phone: '+923009876543' },
        ],
      })
    );
    expect(gate.canSave).toBe(false);
    expect(gate.note).toMatch(/both sides/i);
  });
});

describe('playerError', () => {
  it('matches the API name and phone rules', () => {
    expect(playerError({ name: 'Ali2', phone: '+923001234567' })).toMatch(/letters/);
    expect(playerError({ name: 'Ali Khan', phone: '03001234567' })).toMatch(/country code/);
    expect(playerError({ name: 'Ali Khan', phone: '+923001234567' })).toBeNull();
  });
});

describe('buildQuickMatchPayload', () => {
  it('sends user ids and walk-ups on the same side', () => {
    expect(buildQuickMatchPayload(draft()).home.players).toEqual([
      { name: 'Ali Khan', phone: '+923001234567' },
      { user_id: 9 },
    ]);
  });
});
