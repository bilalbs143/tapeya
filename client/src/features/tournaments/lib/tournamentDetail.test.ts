import { describe, expect, it } from 'vitest';

import { parseTournamentIdParam, tournamentDetailShouldRedirectPublic } from './tournamentDetail';

describe('parseTournamentIdParam', () => {
  it('accepts positive ids only', () => {
    expect(parseTournamentIdParam('12')).toBe(12);
    expect(parseTournamentIdParam('0')).toBeNull();
    expect(parseTournamentIdParam('abc')).toBeNull();
    expect(parseTournamentIdParam(undefined)).toBeNull();
  });
});

describe('tournamentDetailShouldRedirectPublic', () => {
  it('redirects when the viewer cannot manage', () => {
    expect(tournamentDetailShouldRedirectPublic(true)).toBe(false);
    expect(tournamentDetailShouldRedirectPublic(false)).toBe(true);
    expect(tournamentDetailShouldRedirectPublic(undefined)).toBe(true);
  });
});
