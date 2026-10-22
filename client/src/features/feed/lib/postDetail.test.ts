import { describe, expect, it } from 'vitest';

import { isValidPostId, postDetailReplyDraft } from './postDetail';

describe('postDetailReplyDraft', () => {
  it('prefixes the author handle', () => {
    expect(postDetailReplyDraft('ali')).toBe('@ali ');
  });
});

describe('isValidPostId', () => {
  it('requires a positive finite id', () => {
    expect(isValidPostId(12)).toBe(true);
    expect(isValidPostId(0)).toBe(false);
    expect(isValidPostId(Number.NaN)).toBe(false);
  });
});
