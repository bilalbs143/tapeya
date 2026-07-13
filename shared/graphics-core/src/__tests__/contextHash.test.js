import { describe, expect, it } from 'vitest';

import { hashGraphicContext } from '../contextHash.js';

describe('hashGraphicContext', () => {
  it('returns a stable hex hash for the same context payload', () => {
    const context = { score: '100-2', overs: '12.0', batting_team: 'home' };
    expect(hashGraphicContext(context)).toBe(hashGraphicContext({ ...context }));
  });

  it('changes when context content changes', () => {
    const a = hashGraphicContext({ score: '100-2' });
    const b = hashGraphicContext({ score: '101-2' });
    expect(a).not.toBe(b);
  });
});
