import { describe, expect, it } from 'vitest';

import { detectMentionTrigger, splitMentionSegments } from '../displayUtils';

describe('detectMentionTrigger', () => {
  it('detects @ at start of text', () => {
    expect(detectMentionTrigger('@ali', 4)).toEqual({ query: 'ali', start: 0 });
  });

  it('detects @ after whitespace', () => {
    expect(detectMentionTrigger('hey @al', 7)).toEqual({ query: 'al', start: 4 });
  });

  it('returns null when @ is mid-word', () => {
    expect(detectMentionTrigger('email@ali', 9)).toBeNull();
  });

  it('returns null when token has invalid characters', () => {
    expect(detectMentionTrigger('@ali-b', 6)).toBeNull();
  });

  it('allows empty query right after @', () => {
    expect(detectMentionTrigger('hi @', 4)).toEqual({ query: '', start: 3 });
  });

  it('returns null after whitespace ends the token', () => {
    expect(detectMentionTrigger('@ali more', 9)).toBeNull();
  });
});

describe('splitMentionSegments', () => {
  it('returns empty for blank input', () => {
    expect(splitMentionSegments('')).toEqual([]);
    expect(splitMentionSegments()).toEqual([]);
  });

  it('highlights handles and keeps surrounding text', () => {
    expect(splitMentionSegments('hi @ali and @bob_1!')).toEqual([
      { text: 'hi ', isMention: false },
      { text: '@ali', isMention: true },
      { text: ' and ', isMention: false },
      { text: '@bob_1', isMention: true },
      { text: '!', isMention: false },
    ]);
  });

  it('does not treat email addresses as mentions', () => {
    expect(splitMentionSegments('mail me at user@gmail.com')).toEqual([{ text: 'mail me at user@gmail.com', isMention: false }]);
  });
});
