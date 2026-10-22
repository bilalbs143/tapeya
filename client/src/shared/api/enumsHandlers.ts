import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

/** Minimal realistic `GET /enums` fixture for tests. */
export const enumsFixture = {
  playing_role: [
    { value: 'batsman', label: 'Batsman' },
    { value: 'bowler', label: 'Bowler' },
    { value: 'all_rounder', label: 'All Rounder' },
  ],
  batting_style: [
    { value: 'right_hand', label: 'Right Handed Batter' },
    { value: 'left_hand', label: 'Left Handed Batter' },
  ],
  bowling_style: [
    { value: 'right_arm_fast', label: 'Right-Arm Fast' },
    { value: 'right_arm_medium', label: 'Right-Arm Medium' },
    { value: 'left_arm_orthodox', label: 'Left-Arm Orthodox' },
  ],
  cricket_format: [
    { value: 'tape_ball', label: 'Tape Ball' },
    { value: 'hard_ball', label: 'Hard Ball' },
    { value: 'tennis_ball', label: 'Tennis Ball' },
    { value: 'hard_tennis', label: 'Hard Tennis' },
  ],
  tournament_type: [
    { value: 'open_tournament', label: 'Open Tournament' },
    { value: 'private_tournament', label: 'Private Tournament' },
  ],
  stats_bucket: [
    { value: 'open_tournament', label: 'Open Tournament' },
    { value: 'private_tournament', label: 'Private Tournament' },
    { value: 'quick', label: 'Quick' },
  ],
  dismissal_type: [
    {
      value: 'bowled',
      label: 'Bowled',
      requires_fielder: false,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
    {
      value: 'caught',
      label: 'Caught',
      requires_fielder: true,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
    {
      value: 'lbw',
      label: 'LBW',
      requires_fielder: false,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
    {
      value: 'stumped',
      label: 'Stumped',
      requires_fielder: true,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
    {
      value: 'run_out',
      label: 'Run Out',
      requires_fielder: true,
      valid_on_free_hit: true,
      counts_as_wicket: true,
      counts_as_bowler_wicket: false,
    },
    {
      value: 'hit_wicket',
      label: 'Hit Wicket',
      requires_fielder: false,
      valid_on_free_hit: false,
      counts_as_wicket: true,
      counts_as_bowler_wicket: true,
    },
    {
      value: 'obstructing_the_field',
      label: 'Obstructing the Field',
      requires_fielder: false,
      valid_on_free_hit: true,
      counts_as_wicket: true,
      counts_as_bowler_wicket: false,
    },
    {
      value: 'hit_ball_twice',
      label: 'Hit Ball Twice',
      requires_fielder: false,
      valid_on_free_hit: true,
      counts_as_wicket: true,
      counts_as_bowler_wicket: false,
    },
  ],
  no_ball_type: [
    { value: 'over_footed', label: 'Front Foot No-Ball' },
    { value: 'over_heighten', label: 'High Full Toss' },
    { value: 'field_restriction', label: 'Field Restriction' },
    { value: 'bowling_action', label: 'Bowling Action' },
  ],
  no_ball_runs_type: [
    { value: 'from_bat', label: 'From Bat' },
    { value: 'bye', label: 'Bye' },
    { value: 'leg_bye', label: 'Leg Bye' },
  ],
  overthrow_delivery_type: [
    {
      value: 'fair',
      label: 'Fair Delivery',
      valid_for_dismissal_delivery_context: true,
    },
    {
      value: 'wide',
      label: 'Wide',
      valid_for_dismissal_delivery_context: true,
    },
    {
      value: 'no_ball',
      label: 'No Ball',
      valid_for_dismissal_delivery_context: true,
    },
    {
      value: 'bye',
      label: 'Bye',
      valid_for_dismissal_delivery_context: false,
    },
    {
      value: 'leg_bye',
      label: 'Leg Bye',
      valid_for_dismissal_delivery_context: false,
    },
  ],
  penalty_team: [
    { value: 'batting', label: 'Batting' },
    { value: 'bowling', label: 'Bowling' },
  ],
  penalty_reason: [
    { value: 'unfair_actions', label: 'Unfair Actions' },
    { value: 'time_wasting_batting', label: 'Time Wasting by Batting Side' },
  ],
  shot_position: [
    { value: 'deep_fine_leg', label: 'Deep Fine Leg' },
    { value: 'third_man', label: 'Third Man' },
    { value: 'deep_point', label: 'Deep Point' },
    { value: 'deep_cover', label: 'Deep Cover' },
    { value: 'long_off', label: 'Long Off' },
    { value: 'long_on', label: 'Long On' },
    { value: 'mid_wicket', label: 'Mid Wicket' },
    { value: 'square_leg', label: 'Square Leg' },
  ],
  match_overs: [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
  ],
  players_per_side: [
    { value: '8', label: '8' },
    { value: '11', label: '11' },
  ],
  toss_choice: [
    { value: 'bat', label: 'Bat' },
    { value: 'bowl', label: 'Bowl' },
  ],
  extra_type: [
    { value: 'wd', label: 'Wide', short_label: 'WD' },
    { value: 'nb', label: 'No Ball', short_label: 'NB' },
    { value: 'bye', label: 'Bye', short_label: 'BYE' },
    { value: 'lb', label: 'Leg Bye', short_label: 'LB' },
  ],
};

export const enumsHandlers = [
  http.get(`${env.VITE_API_URL}/enums`, () =>
    HttpResponse.json({ type: 'SUCCESS', message: null, data: enumsFixture })
  ),
];
