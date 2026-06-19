import { describe, expect, it } from 'vitest';

import { isNotOutBatter, resolvePlayerDisplayName, withNotOutNameSuffix } from '../notOut';

describe('notOut helpers', () => {
  it('detects not_out status and dismissal text', () => {
    expect(isNotOutBatter({ status: 'not_out' })).toBe(true);
    expect(isNotOutBatter({ dismissal: 'NOT OUT' })).toBe(true);
    expect(isNotOutBatter({ star: true })).toBe(true);
    expect(isNotOutBatter({ status: 'dismissed', dismissal_text: 'c X b Y' })).toBe(false);
    expect(isNotOutBatter({ status: 'dismissed', is_at_crease: true })).toBe(false);
  });

  it('appends asterisk suffix to batter name', () => {
    expect(withNotOutNameSuffix('ALI', true)).toBe('ALI*');
    expect(withNotOutNameSuffix('ALI', false)).toBe('ALI');
  });

  it('resolves backend display_name for scorecard rows', () => {
    expect(resolvePlayerDisplayName({ display_name: 'MIRZA' })).toBe('MIRZA');
    expect(resolvePlayerDisplayName({ name: 'SATTI' })).toBe('SATTI');
  });
});
