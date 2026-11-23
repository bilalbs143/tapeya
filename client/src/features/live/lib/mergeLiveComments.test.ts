import { describe, expect, it } from 'vitest';

import type { LiveComment } from '../model/schemas';
import {
  LIVE_COMMENT_MAX,
  mergeLiveCommentHistory,
  removeLiveComment,
  replaceOptimisticLiveComment,
  trimLiveComments,
  upsertLiveComment,
} from './mergeLiveComments';

function comment(id: string, text = id): LiveComment {
  return { id, name: 'A', text, sentAt: null, avatarUrl: null };
}

describe('trimLiveComments', () => {
  it('keeps the trailing window', () => {
    const rows = Array.from({ length: LIVE_COMMENT_MAX + 5 }, (_, i) => comment(String(i)));
    const trimmed = trimLiveComments(rows);
    expect(trimmed).toHaveLength(LIVE_COMMENT_MAX);
    expect(trimmed[0]?.id).toBe('5');
    expect(trimmed.at(-1)?.id).toBe(String(LIVE_COMMENT_MAX + 4));
  });
});

describe('upsertLiveComment', () => {
  it('appends new ids and replaces existing', () => {
    const base = [comment('1', 'a')];
    expect(upsertLiveComment(base, comment('2', 'b')).map((c) => c.id)).toEqual(['1', '2']);
    expect(upsertLiveComment(base, comment('1', 'z'))[0]?.text).toBe('z');
  });
});

describe('mergeLiveCommentHistory', () => {
  it('prefers history order and keeps local-only optimistic rows', () => {
    const local = [comment('1'), comment('3'), comment('local-1', 'hi')];
    const history = [comment('1'), comment('2'), comment('3')];
    expect(mergeLiveCommentHistory(local, history).map((c) => c.id)).toEqual(['1', '2', '3', 'local-1']);
  });
});

describe('replaceOptimisticLiveComment', () => {
  it('drops the optimistic id and appends the server row', () => {
    const local = [comment('1'), comment('local-9', 'yo')];
    const next = replaceOptimisticLiveComment(local, 'local-9', comment('99', 'yo'));
    expect(next.map((c) => c.id)).toEqual(['1', '99']);
  });
});

describe('removeLiveComment', () => {
  it('removes by id', () => {
    expect(removeLiveComment([comment('1'), comment('2')], '1').map((c) => c.id)).toEqual(['2']);
  });
});
