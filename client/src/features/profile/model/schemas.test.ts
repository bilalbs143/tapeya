import { describe, expect, it } from 'vitest';

import {
  enumToSelectValue,
  PROFILE_FIELD_NONE,
  profileStrength,
  toPublicProfile,
  toUpdateProfileWire,
} from './schemas';

const PLAYING_ROLE_FIXTURE = [
  { value: 'batsman', label: 'Batsman' },
  { value: 'bowler', label: 'Bowler' },
  { value: 'all_rounder', label: 'All Rounder' },
] as const;

describe('profile edit helpers', () => {
  it('maps enum names into select values', () => {
    expect(enumToSelectValue('ALL_ROUNDER', 'All Rounder', PLAYING_ROLE_FIXTURE)).toBe('all_rounder');
    expect(enumToSelectValue(null, null, PLAYING_ROLE_FIXTURE)).toBe(PROFILE_FIELD_NONE);
  });
  it('builds a wire body with nulls for unset selects', () => {
    expect(
      toUpdateProfileWire({
        name: 'Ayesha Khan',
        nickname: 'Ayesha',
        email: '',
        dateOfBirth: '',
        playingRole: 'batsman',
        battingStyle: PROFILE_FIELD_NONE,
        bowlingStyle: PROFILE_FIELD_NONE,
        country: 'Pakistan',
        city: 'Karachi',
      })
    ).toEqual({
      name: 'Ayesha Khan',
      nickname: 'Ayesha',
      email: null,
      date_of_birth: null,
      playing_role: 'batsman',
      batting_style: null,
      bowling_style: null,
      country: 'Pakistan',
      city: 'Karachi',
    });
  });

  it('scores profile strength from filled fields', () => {
    expect(
      profileStrength(
        {
          name: 'A',
          nickname: 'A',
          email: '',
          dateOfBirth: '',
          playingRole: PROFILE_FIELD_NONE,
          battingStyle: PROFILE_FIELD_NONE,
          bowlingStyle: PROFILE_FIELD_NONE,
          country: '',
          city: '',
        },
        false
      )
    ).toBe(20);
  });
});

describe('toPublicProfile', () => {
  it('maps follow flag and summary fields', () => {
    const profile = toPublicProfile({
      id: 11,
      name: 'Sara Ali',
      nickname: 'sara',
      avatar_url: null,
      playing_role: 'Batsman',
      city: 'Lahore',
      country: 'Pakistan',
      followers_count: 40,
      following_count: 12,
      reels_count: 3,
      posts_count: 5,
      is_official: false,
      is_following: true,
    });
    expect(profile.isFollowing).toBe(true);
    expect(profile.followersCount).toBe(40);
    expect(profile.nickname).toBe('sara');
  });
});
