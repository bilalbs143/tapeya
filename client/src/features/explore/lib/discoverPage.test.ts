import { describe, expect, it } from 'vitest';

import { DISCOVER_SECTION_LABEL, DISCOVER_SUGGESTIONS_LIMIT } from './discoverPage';

describe('discoverPage constants', () => {
  it('exposes the suggestions limit and section label', () => {
    expect(DISCOVER_SUGGESTIONS_LIMIT).toBe(20);
    expect(DISCOVER_SECTION_LABEL).toBe('Players to Follow');
  });
});
