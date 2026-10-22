import { describe, expect, it } from 'vitest';

import { adminPlayerInitials, adminPrimaryLabel, adminRulesRows } from './adminActionSheetMeta';

describe('adminActionSheetMeta', () => {
  it('builds initials from one or two name parts', () => {
    expect(adminPlayerInitials('Ali')).toBe('AL');
    expect(adminPlayerInitials('Ali Khan')).toBe('AK');
    expect(adminPlayerInitials('')).toBe('?');
  });

  it('labels the primary CTA per action', () => {
    expect(adminPrimaryLabel('change_keeper')).toBe('Save Keeper');
    expect(adminPrimaryLabel('match_rules')).toBe('Close');
  });

  it('derives max-per-bowler from overs', () => {
    const rows = Object.fromEntries(adminRulesRows(20, 11));
    expect(rows.Overs).toBe('20');
    expect(rows['Players Per Side']).toBe('11');
    expect(rows['Max Per Bowler']).toBe('4');
  });
});
