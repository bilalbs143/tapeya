import { describe, expect, it } from 'vitest';

import { buildGraphicsAccessToken } from '@/graphics/bootstrap/graphicsAccessToken';
import { parseGraphicsLocation } from '@/graphics/bootstrap/parseGraphicsLocation';

const SIGNATURE = 'a'.repeat(64);
const FUTURE_EXPIRES = String(Math.floor(Date.now() / 1000) + 86400);
const PAST_EXPIRES = '999';
const TOKEN = buildGraphicsAccessToken({ sessionId: '42', expires: FUTURE_EXPIRES, signature: SIGNATURE });
const EXPIRED_TOKEN = buildGraphicsAccessToken({ sessionId: '42', expires: PAST_EXPIRES, signature: SIGNATURE });

describe('parseGraphicsLocation', () => {
  it('parses signed graphics access token from root path', () => {
    const result = parseGraphicsLocation({
      pathname: `/${TOKEN}`,
      search: '',
    });

    expect(result).toEqual({
      accessToken: TOKEN,
      sessionId: '42',
      expires: FUTURE_EXPIRES,
      signature: SIGNATURE,
    });
  });

  it('parses trailing slash on token path', () => {
    const result = parseGraphicsLocation({
      pathname: `/${TOKEN}/`,
      search: '',
    });

    expect(result?.sessionId).toBe('42');
    expect(result?.accessToken).toBe(TOKEN);
  });

  it('returns error object for expired token', () => {
    const result = parseGraphicsLocation({
      pathname: `/${EXPIRED_TOKEN}`,
      search: '',
    });

    expect(result).toEqual({
      error: 'expired',
      accessToken: EXPIRED_TOKEN,
      sessionId: '42',
      expires: PAST_EXPIRES,
    });
  });

  it('returns null for legacy /overlay/ paths', () => {
    expect(
      parseGraphicsLocation({
        pathname: `/overlay/${TOKEN}`,
        search: '',
      }),
    ).toBeNull();
  });

  it('returns null for invalid token shape', () => {
    expect(parseGraphicsLocation({ pathname: '/not-a-token', search: '' })).toBeNull();
  });

  it('returns null for empty path', () => {
    expect(parseGraphicsLocation({ pathname: '/', search: '' })).toBeNull();
  });

  it('returns null when path is not a graphics route', () => {
    expect(parseGraphicsLocation({ pathname: '/home', search: '' })).toBeNull();
  });
});
