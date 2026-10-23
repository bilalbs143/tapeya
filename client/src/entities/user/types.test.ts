import { describe, expect, it } from 'vitest';

import { toUserSummary, userHandle, userRoleChips, type UserSummaryWire } from './types';

describe('toUserSummary', () => {
  it('maps wire avatar_url and optional profile fields', () => {
    const wire: UserSummaryWire = {
      id: 9,
      name: 'Ayesha',
      nickname: 'ayesha',
      avatar_url: 'https://cdn.example/a.jpg',
      email: 'a@example.com',
      phone: '+923001234567',
      date_of_birth: '1998-05-01',
      playing_role: 'All Rounder',
      playing_role_enum: 'ALL_ROUNDER',
      batting_style_enum: 'RIGHT_HAND',
      batting_style: 'Right Handed Batter',
      city: 'Karachi',
      country: 'Pakistan',
      followers_count: 120,
      following_count: 40,
      reels_count: 8,
      posts_count: 3,
      is_official: true,
    };

    const user = toUserSummary(wire);
    expect(user).toMatchObject({
      id: 9,
      name: 'Ayesha',
      nickname: 'ayesha',
      avatarUrl: 'https://cdn.example/a.jpg',
      email: 'a@example.com',
      phone: '+923001234567',
      dateOfBirth: '1998-05-01',
      playingRole: 'All Rounder',
      playingRoleEnum: 'ALL_ROUNDER',
      battingStyleEnum: 'RIGHT_HAND',
      city: 'Karachi',
      followersCount: 120,
      isOfficial: true,
      canBroadcast: false,
      broadcastTermsAcceptedAt: null,
      termsAcceptedAt: null,
      vendor: null,
    });
    expect(userHandle(user)).toBe('ayesha');
    expect(userRoleChips(user)).toEqual(['All Rounder', 'Right Handed Batter']);
  });

  it('maps optional vendor from /me', () => {
    const wire: UserSummaryWire = {
      id: 2,
      name: 'Seller',
      nickname: 'seller',
      avatar_url: null,
      vendor: { id: 9, store_name: 'Bat Co', status: 'approved' },
    };
    expect(toUserSummary(wire).vendor).toEqual({
      id: 9,
      storeName: 'Bat Co',
      status: 'approved',
    });
  });
});
