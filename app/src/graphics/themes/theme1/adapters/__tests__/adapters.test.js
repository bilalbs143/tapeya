import { describe, expect, it } from 'vitest';

import { createTestSnapshot, PROCESSOR_MAP } from '@/graphics/core/processors/__tests__/fixtures';

import { assets } from '../../config';
import { toBreakBundle, toNextMatchBundle, toThisMatchBundle } from '../break.adapter';
import { toCustomCaptionData } from '../caption.adapter';
import { toPhaseChartData, toWagonWheelData, toWormChartData } from '../chart.adapter';
import { toFallOfWicketsData, toLastWicketFsBatter } from '../fallOfWickets.adapter';
import {
  toBattingSummaryBundle,
  toBowlingSummaryBundle,
  toInningFiguresBundle,
  toMatchSummaryBundle,
  toNeedTargetBundle,
  toPartnershipBundle,
  toPartnershipListBundle,
  toPlaying11Bundle,
} from '../fullScreen.adapter';
import { toLeaderboardData } from '../leaderboard.adapter';
import { toMatchFixtureBundle, toTournamentNameBundle } from '../matchFixture.adapter';
import { toMatchSummaryLtBundle } from '../matchSummary.adapter';
import { toMiniScoreCardBundle } from '../miniScoreCard.adapter';
import { toOfficialsData } from '../officials.adapter';
import {
  toBatsmanMatchLt,
  toBatsmanTournamentLt,
  toBowlerMatchLt,
  toBowlerTournamentLt,
  toMomPlayer,
  toPlayer,
} from '../player.adapter';
import { toPointTableData } from '../pointTable.adapter';
import { toScoreBarBundle, toTourHitBundle } from '../scoreBar.adapter';
import { toSquadBundle } from '../squad.adapter';
import { toStrategicTimeoutBundle } from '../strategicTimeout.adapter';
import { toTeams } from '../teams.adapter';
import { formatLiveFromVenueLine } from '../venueLine.adapter';

describe('theme1 officials adapter', () => {
  it('maps processOfficialsBanner output to OfficialsLTBar data', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'UMPIRES' },
      context: {
        match: {
          officials: {
            umpires: { text: 'Umpire One\nUmpire Two', lines: ['Umpire One', 'Umpire Two'] },
          },
        },
      },
    });

    const props = PROCESSOR_MAP.UMPIRES(snapshot);
    const officials = toOfficialsData(props);

    expect(officials).toEqual({
      heading: 'Umpires',
      subtitle: 'MATCH',
      names: ['Umpire One', 'Umpire Two'],
      text: 'Umpire One\nUmpire Two',
    });
  });
});

describe('theme1 scoreBar adapter', () => {
  it('maps scoreboard processor output to frame/teams/match', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LT_DEFAULT' },
      context: {
        score: '120-3',
        overs: '15.2',
        batters: [
          { id: 10, name: 'Batter One', runs: 45, balls: 30, on_strike: true },
          { id: 11, name: 'Batter Two', runs: 20, balls: 18, on_strike: false },
        ],
        bowler: { name: 'Bowler One', figures: '2/28', overs: '4.0' },
        current_over_deliveries: [
          { display_token: '1', chip_type: 'single', over_number: 15, ball_in_over: 1 },
          { display_token: '4', chip_type: 'boundary_four', over_number: 15, ball_in_over: 2 },
          { display_token: '0', chip_type: 'dot', over_number: 15, ball_in_over: 3 },
        ],
      },
    });

    const props = PROCESSOR_MAP.LT_DEFAULT(snapshot);
    const tokens = {
      homeTextColor: '#fff',
      homeBgColor: '#0055ff',
      awayTextColor: '#fff',
      awayBgColor: '#ff5500',
      enableImages: true,
    };

    const bundle = toScoreBarBundle(props, tokens);
    expect(bundle).not.toBeNull();
    expect(bundle.frame.total).toBe(120);
    expect(bundle.frame.wkts).toBe(3);
    expect(bundle.frame.striker.name).toBe('Batter One');
    expect(bundle.frame.bowler.figText).toBe('2-28 4.0');
    expect(bundle.match.battingCode).toBe('batting');
    expect(toTeams(props, tokens)?.batting?.code).toBeTruthy();
  });

  it('maps zone C rotation fields onto LT_DEFAULT frame', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LT_DEFAULT' },
      context: {
        innings_number: 1,
        partnership: { runs: 32, balls: 24 },
        projected_score: 186,
      },
    });

    const props = PROCESSOR_MAP.LT_DEFAULT(snapshot);
    const bundle = toScoreBarBundle(props, undefined);

    expect(bundle?.frame.projectedScore).toBe(186);
    expect(bundle?.frame.partnership).toEqual({ runs: 32, balls: 24 });
  });

  it('truncates three-part batter names to two broadcast words on LT_DEFAULT', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LT_DEFAULT' },
      context: {
        score: '50-1',
        overs: '8.0',
        batters: [
          { id: 10, name: 'Waqar Saleem Bhatti', runs: 30, balls: 22, on_strike: true },
          { id: 11, name: 'Other Player Name', runs: 15, balls: 10, on_strike: false },
        ],
        bowler: { name: 'Muhammad Ali Khan', figures: '1/20', overs: '3.0' },
      },
    });

    const props = PROCESSOR_MAP.LT_DEFAULT(snapshot);
    const bundle = toScoreBarBundle(props, undefined);

    expect(bundle?.frame.striker.name).toBe('Waqar Saleem');
    expect(bundle?.frame.nonStriker.name).toBe('Other Player');
    expect(bundle?.frame.bowler.name).toBe('Muhammad Ali');
  });

  it('maps all current-over deliveries including extras onto thisOverChips', () => {
    const deliveries = [
      { display_token: '6', chip_type: 'boundary_six', over_number: 1, ball_in_over: 1 },
      { display_token: '6', chip_type: 'boundary_six', over_number: 1, ball_in_over: 2 },
      { display_token: '1', chip_type: 'single', over_number: 1, ball_in_over: 3 },
      { display_token: '4', chip_type: 'boundary_four', over_number: 1, ball_in_over: 4 },
      { display_token: 'WD', chip_type: 'wide', over_number: 1, ball_in_over: 5 },
      { display_token: '0', chip_type: 'dot', over_number: 1, ball_in_over: 6 },
      { display_token: 'WD', chip_type: 'wide', over_number: 1, ball_in_over: 7 },
    ];
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LT_DEFAULT' },
      context: {
        score: '55-0',
        overs: '1.5',
        current_over_deliveries: deliveries,
      },
    });

    const props = PROCESSOR_MAP.LT_DEFAULT(snapshot);
    const bundle = toScoreBarBundle(props, undefined);

    expect(bundle?.frame.thisOverChips).toHaveLength(7);
    expect(bundle?.frame.thisOverChips.map((chip) => chip.code)).toEqual(['6', '6', '1', '4', 'WD', '0', 'WD']);
  });

  it('maps last 12 balls runs onto frame for LastBallsPanel', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LAST_12_BALLS' },
      context: {
        last_12_balls: {
          dots: 4,
          fours: 2,
          sixes: 1,
          wickets: 1,
          runs: 24,
          deliveries: [{ over_number: 5, ball_in_over: 3, display_token: '4' }],
        },
      },
    });

    const props = PROCESSOR_MAP.LAST_12_BALLS(snapshot);
    const bundle = toScoreBarBundle(props, undefined, { barVariant: 'last12Balls' });

    expect(bundle?.frame.last12Runs).toBe(24);
    expect(bundle?.frame.runs).toBe(24);
    expect(bundle?.frame.last12Chips).toEqual([{ code: '4', chipType: 'single' }]);
  });

  it('keeps illegal deliveries such as wides in last 12 balls strip', () => {
    const deliveries = [
      { over_number: 0, ball_in_over: 1, display_token: '4', chip_type: 'boundary_four' },
      { over_number: 0, ball_in_over: 2, display_token: '1', chip_type: 'single' },
      { over_number: 0, ball_in_over: 3, display_token: '6', chip_type: 'boundary_six' },
      { over_number: 0, ball_in_over: 4, display_token: '2', chip_type: 'single' },
      { over_number: 0, ball_in_over: 5, display_token: 'WD', chip_type: 'wide' },
      { over_number: 0, ball_in_over: 6, display_token: '0', chip_type: 'dot' },
      { over_number: 0, ball_in_over: 7, display_token: '6', chip_type: 'boundary_six' },
    ];
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LAST_12_BALLS' },
      context: {
        last_12_balls: {
          dots: 1,
          fours: 1,
          sixes: 2,
          wickets: 0,
          runs: 20,
          deliveries,
        },
      },
    });

    const props = PROCESSOR_MAP.LAST_12_BALLS(snapshot);
    const bundle = toScoreBarBundle(props, undefined, { barVariant: 'last12Balls' });

    expect(bundle?.frame.last12Chips).toHaveLength(7);
    expect(bundle?.frame.last12Chips.map((chip) => chip.code)).toEqual(['4', '1', '6', '2', 'WD', '0', '6']);
  });

  it('maps win prediction processor output onto frame.predictions', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WIN_PREDICTION' },
      context: { win_probability: { home: 62, away: 38 }, batting_team: 'home' },
    });

    const props = PROCESSOR_MAP.WIN_PREDICTION(snapshot);
    const bundle = toScoreBarBundle(props, undefined, { barVariant: 'winPrediction' });

    expect(bundle?.frame.predictions).toEqual([
      { teamCode: 'batting', percent: 62 },
      { teamCode: 'bowling', percent: 38 },
    ]);
    expect(bundle?.frame.barVariant).toBe('winPrediction');
  });

  it('toTourHitBundle uses tournament logo in mini strip (not Tapeya brand)', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOUR_RUNS', display_mode: 'LT' },
      context: {
        tournament: { name: 'PSL', short: 'PSL', logo_url: 'https://example.com/psl.png' },
        tournament_aggregates: { total_runs: 4200 },
      },
    });

    const props = PROCESSOR_MAP.TOUR_RUNS(snapshot);
    const bundle = toTourHitBundle(props, undefined);

    expect(bundle?.frame.mini.logoUrl).toBe('https://example.com/psl.png');
    expect(bundle?.frame.mini.shortCode).toBe('PSL');
    expect(bundle?.frame.mini.logoUrl).not.toBe(assets.brandLogoWhite);
  });

  it('toTourHitBundle falls back to tournament short code when logo is missing', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOUR_SIXES', display_mode: 'LT' },
      context: {
        tournament: { name: 'Pallandari Super League', short: 'PSL' },
        tournament_aggregates: { total_sixes: 88 },
      },
    });

    const props = PROCESSOR_MAP.TOUR_SIXES(snapshot);
    const bundle = toTourHitBundle(props, undefined);

    expect(bundle?.frame.mini.logoUrl).toBeNull();
    expect(bundle?.frame.mini.shortCode).toBe('PSL');
    expect(bundle?.frame.mini.title).toBe('SIXES');
  });

  it('toTourHitBundle derives short code from tournament name when short is missing', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOUR_RUNS', display_mode: 'LT' },
      context: {
        tournament: { name: 'Pallandari Super League' },
        tournament_aggregates: { total_runs: 120 },
      },
    });

    const props = PROCESSOR_MAP.TOUR_RUNS(snapshot);
    const bundle = toTourHitBundle(props, undefined);

    expect(bundle?.frame.mini.shortCode).toBe('PSL');
  });
});

describe('theme1 matchFixture adapter', () => {
  it('maps tournament name processor output to crest-strip fixture', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'TOURNAMENT_NAME',
        payload: { match_label: 'PSLS3 - POLL B' },
      },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Home XI',
          away_team_name: 'Away XI',
          home_team_short_code: 'HOM',
          away_team_short_code: 'AWY',
          venue: 'Sports Stadium Pallandri',
          venue_display_line: 'LIVE FROM Sports Stadium Pallandri',
        },
      },
    });

    const props = PROCESSOR_MAP.TOURNAMENT_NAME(snapshot);
    const bundle = toTournamentNameBundle(props, undefined);

    expect(bundle?.fixture.title).toBe('PALLANDARI SUPER LEAGUE SEASON 3');
    expect(bundle?.fixture.matchDetail).toBe('LIVE FROM SPORTS STADIUM PALLANDRI');
    expect(bundle?.fixture.teams).toHaveLength(2);
    expect(bundle?.teams.home.code).toBeTruthy();
    expect(bundle?.teams.away.code).toBeTruthy();
  });

  it('maps result LT processor output to crest-strip fixture', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'RESULT_LT',
        payload: { result_line: 'Home XI won by 5 wickets' },
      },
    });

    const props = PROCESSOR_MAP.RESULT_LT(snapshot);
    const bundle = toMatchFixtureBundle(props, undefined, 'matchDetail');

    expect(bundle?.fixture.matchDetail).toBe('HOME XI WON BY 5 WICKETS');
    expect(bundle?.fixture.title).toBe('');
    expect(bundle?.fixture.teams).toHaveLength(2);
  });

  it('maps toss LT processor output via presentationLabels formatter', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOSS_LT' },
      context: {
        match: {
          toss_winner_side: 'home',
          chose_to_bat_or_bowl: 'bat',
        },
      },
    });

    const props = PROCESSOR_MAP.TOSS_LT(snapshot);
    const bundle = toMatchFixtureBundle(props, undefined, 'decision');

    expect(bundle?.fixture.matchDetail).toBe('HOME XI WON THE TOSS AND ELECTED TO BAT FIRST');
  });
});

describe('theme1 fullScreen adapter fixtures', () => {
  it('maps theme-controller batting summary fixture to graphic bundle', () => {
    const bundle = toBattingSummaryBundle({
      title: 'SARDAR ONE KHAN CLUB SANGHAR',
      sub: 'PALLANDARI SUPER LEAGUE SEASON 3',
      teamCode: 'soc',
      accent: '#9b7bff',
      crestLogoUrl: 'https://example.com/logo.png',
      scoreStrip: { extras: 6, overs: '4.5', total: '105-0' },
      batsmen: [{ name: 'MIRZA', dismissal: 'NOT OUT', runs: 28, balls: 10 }],
    });

    expect(bundle?.teams?.soc?.code).toBe('SOC');
    expect(bundle?.data?.title).toBe('SARDAR ONE KHAN CLUB SANGHAR');
    expect(bundle?.data?.batsmen).toHaveLength(1);
    expect(bundle?.data?.batsmen?.[0]?.dismissal).toBe('NOT OUT');
  });

  it('maps live batting order not_out rows with NOT OUT dismissal and name asterisk flag', () => {
    const bundle = toBattingSummaryBundle({
      battingOrder: [
        { display_name: 'MIRZA', status: 'not_out', runs: 28, balls: 10, is_at_crease: true },
        { display_name: 'SATTI', status: 'dismissed', runs: 56, balls: 14, dismissal_text: 'c Mirza b X' },
      ],
      battingTeam: { name: 'Home XI', shortCode: 'HOM' },
      inningsExtras: 6,
      inningsOvers: '4.5',
      inningsScore: '105-0',
    });

    expect(bundle?.data?.batsmen?.[0]).toMatchObject({
      name: 'MIRZA',
      runs: 28,
      notOut: true,
      dismissal: 'NOT OUT',
    });
    expect(bundle?.data?.batsmen?.[1]).toMatchObject({
      name: 'SATTI',
      runs: 56,
      notOut: false,
      dismissal: 'c Mirza b X',
    });
  });

  it('maps live partnership batters as not out for name asterisk', () => {
    const bundle = toPartnershipBundle({
      partnershipRuns: 45,
      partnershipBalls: 30,
      battingTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
      bowlingTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
      batters: [
        { name: 'MIRZA', runs: 28, balls: 10, onStrike: true },
        { name: 'HAMEED', runs: 17, balls: 20, onStrike: false },
      ],
    });

    expect(bundle?.data?.batters?.[0]).toMatchObject({ fullName: 'MIRZA', notOut: true });
    expect(bundle?.data?.batters?.[1]).toMatchObject({ fullName: 'HAMEED', notOut: true });
  });

  it('maps live match summary top batters with not-out flag from backend shape', () => {
    const bundle = toMatchSummaryBundle({
      homeTeam: { name: 'Home', logoUrl: null },
      awayTeam: { name: 'Away', logoUrl: null },
      innings: [
        {
          team_code: 'home',
          runs: 105,
          wickets: 0,
          overs_display: '4.5',
          top_batsmen: [
            { display_name: 'MIRZA', runs: 28, balls: 10, is_not_out: true },
            { display_name: 'HAMEED', runs: 71, balls: 20, is_not_out: true },
            { display_name: 'SATTI', runs: 56, balls: 14, is_not_out: false },
          ],
          top_bowlers: [{ display_name: 'SOHAWA', wickets: 0, runs_conceded: 52, overs_display: '2.0' }],
        },
      ],
    });

    expect(bundle?.data?.innings?.[0]?.batsmen?.[0]).toMatchObject({
      name: 'MIRZA',
      notOut: true,
    });
    expect(bundle?.data?.innings?.[0]?.batsmen?.[2]).toMatchObject({
      name: 'SATTI',
      notOut: false,
    });
    expect(bundle?.data?.innings?.[0]?.bowlers?.[0]).toMatchObject({
      name: 'SOHAWA',
      wickets: 0,
      runs: 52,
    });
  });

  it('maps preview fixture rows even when homeTeam is present', () => {
    const bundle = toMatchSummaryBundle({
      homeTeam: { name: 'Home', logoUrl: null },
      awayTeam: { name: 'Away', logoUrl: null },
      crests: {
        top: { teamCode: 'fcm', accent: '#f0a93c' },
        bottom: { teamCode: 'soc', accent: '#9b7bff' },
      },
      innings: [
        {
          teamCode: 'soc',
          shortName: 'SARDAR ONE',
          total: 105,
          wickets: 0,
          overs: '4.5',
          batsmen: [{ name: 'MIRZA', runs: 28, balls: 10, star: true }],
          bowlers: [{ name: 'SOHAWA', wickets: 0, runs: 52, overs: '2.0' }],
        },
      ],
    });

    expect(bundle?.data?.innings?.[0]?.batsmen?.[0]).toMatchObject({
      name: 'MIRZA',
      notOut: true,
    });
    expect(bundle?.data?.innings?.[0]?.bowlers?.[0]?.name).toBe('SOHAWA');
    expect(bundle?.data?.innings?.[0]?.accent).toBe('#9b7bff');
  });

  it('keeps team accent on live innings when match tokens are empty strings', () => {
    const bundle = toMatchSummaryBundle(
      {
        homeTeam: { name: 'Friends', shortCode: 'FCM', logoUrl: null },
        awayTeam: { name: 'Sardar', shortCode: 'SOC', logoUrl: null },
        innings: [
          {
            batting_team: 'away',
            batting_team_name: 'Sardar One',
            runs: 105,
            wickets: 0,
            overs_display: '4.5',
            top_batsmen: [{ display_name: 'MIRZA', runs: 28, balls: 10, is_not_out: true }],
            top_bowlers: [{ display_name: 'SOHAWA', wickets: 0, runs_conceded: 52, overs_display: '2.0' }],
          },
        ],
      },
      {
        homeBgColor: '',
        awayBgColor: '',
        homeTextColor: '',
        awayTextColor: '',
      },
    );

    expect(bundle?.data?.innings?.[0]?.accent).toBe('var(--accentB)');
  });

  it('maps backend innings_summaries shape through processor props', () => {
    const bundle = toMatchSummaryBundle({
      homeTeam: { name: 'Friends', shortCode: 'FCM', logoUrl: null },
      awayTeam: { name: 'Sardar', shortCode: 'SOC', logoUrl: null },
      innings: [
        {
          batting_team: 'away',
          batting_team_name: 'Sardar One',
          runs: 105,
          wickets: 0,
          overs_display: '4.5',
          top_batsmen: [{ display_name: 'MIRZA', runs: 28, balls: 10, is_not_out: true }],
          top_bowlers: [{ display_name: 'SOHAWA', wickets: 0, runs_conceded: 52, overs_display: '2.0' }],
        },
      ],
    });

    expect(bundle?.data?.innings?.[0]?.teamCode).toBe('away');
    expect(bundle?.data?.innings?.[0]?.batsmen?.[0]?.name).toBe('MIRZA');
    expect(bundle?.data?.innings?.[0]?.bowlers?.[0]?.name).toBe('SOHAWA');
  });

  it('maps live fall_of_wickets shape to last wicket FS batter', () => {
    const bundle = toLastWicketFsBatter({
      tournamentLabel: 'Pallandari Super League Season 3',
      battingTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
      bowlingTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
      wickets: [{ number: '1st', score: '22', batsman_display_name: 'HAMEED' }],
      battingOrder: [
        {
          display_name: 'HAMEED',
          status: 'dismissed',
          runs: 56,
          balls: 32,
          ones: 8,
          twos: 3,
          threes: 1,
          fours: 5,
          sixes: 2,
          dismissal_text: 'c Shah b Satti',
        },
      ],
    });

    expect(bundle?.batter?.name).toBe('HAMEED');
    expect(bundle?.batter?.runs).toBe(56);
    expect(bundle?.batter?.ones).toBe(8);
    expect(bundle?.batter?.twos).toBe(3);
    expect(bundle?.batter?.threes).toBe(1);
    expect(bundle?.batter?.fours).toBe(5);
    expect(bundle?.batter?.sixes).toBe(2);
    expect(bundle?.batter?.dismissal).toBe('C SHAH B SATTI');
  });

  it('derives current partnership FS batters from live batters array', () => {
    const bundle = toPartnershipBundle({
      tournamentLabel: 'Pallandari Super League Season 3',
      battingTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
      bowlingTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
      partnershipRuns: 45,
      partnershipBalls: 32,
      batters: [
        { name: 'Batter One', runs: 28, balls: 10, onStrike: true },
        { name: 'Batter Two', runs: 17, balls: 22, onStrike: false },
      ],
    });

    expect(bundle?.data?.batters).toHaveLength(2);
    expect(bundle?.data?.batters[0].fullName).toBe('Batter One');
    expect(bundle?.data?.partnership).toEqual({ runs: 45, balls: 32 });
  });

  it('maps batter avatar URLs through partnership FS adapter', () => {
    const bundle = toPartnershipBundle({
      partnershipRuns: 11,
      partnershipBalls: 6,
      battingTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
      bowlingTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
      batters: [
        { name: 'WAQAR SALAM', runs: 5, balls: 2, onStrike: true, imageUrl: 'https://cdn.example/waqar.jpg' },
        { name: 'KHUSHDIL SHAH', runs: 6, balls: 3, onStrike: false, image_url: 'https://cdn.example/khushdil.jpg' },
      ],
    });

    expect(bundle?.data?.batters?.[0]?.avatarUrl).toBe('https://cdn.example/waqar.jpg');
    expect(bundle?.data?.batters?.[1]?.avatarUrl).toBe('https://cdn.example/khushdil.jpg');
    expect(bundle?.data?.defaultAvatarUrl).toBeTruthy();
  });

  it('maps broadcast partnership_history to partnership list rows', () => {
    const bundle = toPartnershipListBundle({
      tournamentLabel: 'Pallandari Super League Season 3',
      battingTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null, score: '142/4', overs: '18.2' },
      inningsExtras: 8,
      inningsScore: '142/4',
      partnerships: [
        {
          batter1_display_name: 'KHAN',
          batter2_display_name: 'MIRZA',
          batter1_runs: 34,
          batter2_runs: 21,
          batter1_balls: 28,
          batter2_balls: 19,
          batter1_avatar_url: 'https://cdn.example/khan.jpg',
          batter2_avatar_url: 'https://cdn.example/mirza.jpg',
          runs: 55,
          balls: 47,
        },
        {
          batter1_display_name: 'ALI',
          batter2_display_name: 'RAZA',
          batter1_runs: 18,
          batter2_runs: 12,
          batter1_balls: 14,
          batter2_balls: 11,
          runs: 30,
          balls: 25,
        },
      ],
    });

    expect(bundle?.data?.partnerships).toHaveLength(2);
    expect(bundle?.data?.partnerships[0].batters[0]).toMatchObject({
      fullName: 'KHAN',
      runs: 34,
      balls: 28,
      avatarUrl: 'https://cdn.example/khan.jpg',
    });
    expect(bundle?.data?.partnerships[0].batters[1]).toMatchObject({
      fullName: 'MIRZA',
      runs: 21,
      balls: 19,
      avatarUrl: 'https://cdn.example/mirza.jpg',
    });
    expect(bundle?.data?.scoreStrip).toEqual({ extras: 8, overs: '18.2', total: '142/4' });
  });

  it('maps LT match summary preview fixture to dual-innings bundle', () => {
    const bundle = toMatchSummaryLtBundle({
      label: 'MATCH SUMMARY',
      innings: [
        { teamCode: 'soc', total: 105, wkts: 0, oversText: '4.5' },
        { teamCode: 'fcm', total: 135, wkts: 3, oversText: '6.0' },
      ],
      teams: {
        soc: { code: 'SOC', displayName: 'SARDAR ONE', color: '#9b7bff' },
        fcm: { code: 'FCM', displayName: 'FRIENDS CLUB', color: '#f0a93c' },
      },
    });

    expect(bundle?.summary.innings).toHaveLength(2);
    expect(bundle?.teams?.soc?.displayName).toBe('SARDAR ONE');
    expect(bundle?.summary.innings[0].total).toBe(105);
  });

  it('maps processor innings output to LT match summary bundle', () => {
    const bundle = toMatchSummaryLtBundle(
      {
        homeTeam: { name: 'Sardar One', shortCode: 'SOC', logoUrl: null },
        awayTeam: { name: 'Friends Club', shortCode: 'FCM', logoUrl: null },
        innings: [
          { teamCode: 'home', total: 105, wkts: 0, oversText: '4.5', scoreSep: '-', oversLabel: 'OVER' },
          { teamCode: 'away', total: 135, wkts: 3, oversText: '6.0', scoreSep: '-', oversLabel: 'OVER' },
        ],
      },
      {
        homeBgColor: '#9b7bff',
        awayBgColor: '#f0a93c',
      },
    );

    expect(bundle?.summary.innings[0].teamCode).toBe('home');
    expect(bundle?.summary.innings[1].wkts).toBe(3);
  });
});

describe('theme1 miniScoreCard adapter', () => {
  it('maps processor output to compact LT bundle', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MINI_SCORECARD' },
      context: {
        batting_team: 'home',
        score: '105-0',
        overs: '4.5',
      },
    });

    const props = PROCESSOR_MAP.MINI_SCORECARD(snapshot);
    const bundle = toMiniScoreCardBundle(props, {
      homeBgColor: '#9b7bff',
      awayBgColor: '#f0a93c',
    });

    expect(props.teamCode).toBe('home');
    expect(props.teamLabel).toBe('HOM');
    expect(props.oversText).toBe('4.5 OVER');
    expect(props.total).toBe(105);
    expect(props.wkts).toBe(0);
    expect(bundle?.miniScoreCard?.teamCode).toBe('home');
    expect(bundle?.teams?.home?.code).toBe('HOM');
  });

  it('maps theme-controller preview fixture to mini scorecard bundle', () => {
    const bundle = toMiniScoreCardBundle({
      homeTeam: { name: 'SARDAR ONE', shortCode: 'SOC', logoUrl: null },
      awayTeam: { name: 'FRIENDS CLUB', shortCode: 'FCM', logoUrl: null },
      teamCode: 'home',
      teamLabel: 'SOC',
      oversText: '4.5 OVER',
      total: 105,
      wkts: 0,
      scoreSep: '-',
    });

    expect(bundle?.miniScoreCard).toEqual({
      teamCode: 'home',
      teamLabel: 'SOC',
      oversText: '4.5 OVER',
      total: 105,
      wkts: 0,
      scoreSep: '-',
    });
    expect(bundle?.teams?.home?.code).toBe('SOC');
  });
});

describe('theme1 pointTable adapter', () => {
  it('maps processor output to standings graphic data', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'POINT_TABLE' },
      context: {
        standings: [
          {
            rank: 1,
            team_name: 'Karachi',
            played: 2,
            won: 2,
            lost: 0,
            no_result: 0,
            points: 4,
            nrr: 2.833,
          },
        ],
      },
    });

    const props = PROCESSOR_MAP.POINT_TABLE(snapshot);
    const table = toPointTableData(props);

    expect(props.rows).toHaveLength(1);
    expect(props.rows[0].name).toBe('Karachi');
    expect(table?.data.rows[0].pts).toBe(4);
    expect(table?.data.rows[0].nrr).toBe(2.833);
  });

  it('maps theme-controller preview fixture to point table bundle', () => {
    const table = toPointTableData({
      title: 'POINTS TABLE',
      subtitle: 'PALLANDARI SUPER LEAGUE SEASON 3',
      rows: [{ rank: 1, code: 'karachi', name: 'KARACHI', played: 2, won: 2, lost: 0, nr: 0, pts: 4, nrr: 2.833 }],
      qualifyCount: 4,
      footerText: 'TOP 4 TEAMS QUALIFY FOR PLAYOFFS',
    });

    expect(table?.title).toBe('POINTS TABLE');
    expect(table?.data.rows).toHaveLength(1);
    expect(table?.data.footerText).toBe('TOP 4 TEAMS QUALIFY FOR PLAYOFFS');
  });

  it('preserves null NRR for teams without enough completed overs', () => {
    const table = toPointTableData({
      title: 'POINTS TABLE',
      subtitle: 'League',
      rows: [{ rank: 1, name: 'Team A', played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: null }],
    });

    expect(table?.data.rows[0].nrr).toBeNull();
  });
});

describe('theme1 strategicTimeout adapter', () => {
  it('maps processor output to countdown graphic bundle', () => {
    const bundle = toStrategicTimeoutBundle(
      {
        homeTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
        awayTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
        label: 'STRATEGIC TIMEOUT',
        tournamentName: 'PALLANDARI SUPER LEAGUE SEASON 3',
        venueDisplayLine: 'LIVE FROM SPORTS STADIUM PALLANDRI SUDHNOTI...',
      },
      {
        homeBgColor: '#9b7bff',
        awayBgColor: '#f0a93c',
      },
    );

    expect(bundle?.data.caption).toBe('STRATEGIC TIMEOUT');
    expect(bundle?.data.venueLine).toBe('LIVE FROM SPORTS STADIUM PALLANDRI SUDHNOTI...');
    expect(bundle?.data.tournamentName).toBe('PALLANDARI SUPER LEAGUE SEASON 3');
    expect(bundle?.teams?.home?.code).toBe('HOM');
    expect(bundle?.data.teams).toHaveLength(2);
  });
});

describe('theme1 break adapter', () => {
  const tokens = {
    homeBgColor: '#9b7bff',
    awayBgColor: '#f0a93c',
  };

  it('maps break processor output with live-from venue line', () => {
    const bundle = toBreakBundle(
      {
        homeTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
        awayTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
        label: 'TEA BREAK',
        tournamentName: 'PALLANDARI SUPER LEAGUE SEASON 3',
        venue: 'Sports Stadium Pallandri',
      },
      tokens,
    );

    expect(bundle?.breakData.caption).toBe('TEA BREAK');
    expect(bundle?.breakData.venueLine).toBe('LIVE FROM Sports Stadium Pallandri');
  });

  it('maps next match through shared break bundle with venue line', () => {
    const bundle = toNextMatchBundle(
      {
        homeTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
        awayTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
        venueDisplayLine: 'LIVE FROM SPORTS STADIUM PALLANDRI SUDHNOTI...',
      },
      tokens,
    );

    expect(bundle?.breakData.caption).toBe('NEXT MATCH');
    expect(bundle?.breakData.venueLine).toBe('LIVE FROM SPORTS STADIUM PALLANDRI SUDHNOTI...');
  });

  it('maps this match through shared break bundle like innings break', () => {
    const bundle = toThisMatchBundle(
      {
        homeTeam: { name: 'Home XI', shortCode: 'HOM', logoUrl: null },
        awayTeam: { name: 'Away XI', shortCode: 'AWY', logoUrl: null },
        tournamentName: 'PALLANDARI SUPER LEAGUE SEASON 3',
        venue: 'Sports Stadium Pallandri',
      },
      tokens,
    );

    expect(bundle?.breakData.caption).toBe('THIS MATCH');
    expect(bundle?.breakData.tournamentName).toBe('PALLANDARI SUPER LEAGUE SEASON 3');
    expect(bundle?.breakData.venueLine).toBe('LIVE FROM Sports Stadium Pallandri');
    expect(bundle?.teams?.home?.code).toBe('HOM');
  });
});

describe('theme1 player match LT adapters', () => {
  const tokens = {
    homeBgColor: '#0055ff',
    awayBgColor: '#ff5500',
  };

  it('maps batsman match processor output to BatsmanMatchLTBar shape', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_MATCH_LT',
        payload: { user_id: 10, team_id: 1 },
      },
      context: {
        batters: [
          {
            id: 10,
            name: 'Taimoor Mirza',
            runs: 28,
            balls: 10,
            ones: 4,
            twos: 1,
            threes: 0,
            fours: 1,
            sixes: 3,
            is_dismissed: false,
          },
        ],
      },
    });

    const props = PROCESSOR_MAP.BATSMAN_MATCH_LT(snapshot);
    const resolved = toBatsmanMatchLt(props, tokens);

    expect(resolved?.batter.name).toBe('Taimoor Mirza');
    expect(resolved?.batter.runs).toBe(28);
    expect(resolved?.batter.balls).toBe(10);
    expect(resolved?.batter.fours).toBe(1);
    expect(resolved?.batter.sixes).toBe(3);
    expect(resolved?.batter.notOut).toBe(true);
  });

  it('maps bowler match processor output to BowlerMatchLTBar shape', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BOWLER_MATCH_LT',
        payload: { user_id: 20, team_id: 2 },
      },
      context: {
        bowler: {
          user_id: 20,
          name: 'Itsham Satti',
          figures: '0/27',
          overs: '1.5',
          dots: 2,
          extras_conceded: 2,
          economy: '18.00',
        },
      },
    });

    const props = PROCESSOR_MAP.BOWLER_MATCH_LT(snapshot);
    const resolved = toBowlerMatchLt(props, tokens);

    expect(resolved?.bowler.name).toBe('Itsham Satti');
    expect(resolved?.bowler.w).toBe(0);
    expect(resolved?.bowler.r).toBe(27);
    expect(resolved?.bowler.overs).toBe('1.5');
    expect(resolved?.bowler.dots).toBe(2);
    expect(resolved?.bowler.extras).toBe(2);
    expect(resolved?.bowler.econ).toBe('18.00');
  });

  it('maps batsman tournament processor output to BatsmanTournamentLTBar shape', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_TOURNAMENT_LT',
        payload: {
          user_id: 10,
          team_id: 1,
          player: { name: 'Taimoor Mirza', team: 'HOM', role: 'Batsman' },
          tournament_batting: {
            matches: 6,
            runs: 198,
            fours: 4,
            sixes: 27,
            fifties: 0,
            hundreds: 1,
            strike_rate: 295.52,
            average: 66,
          },
          stats: [
            { label: 'Matches', value: 6 },
            { label: 'Runs', value: 198 },
            { label: '4s', value: 4 },
            { label: '6s', value: 27 },
            { label: '50s', value: 0 },
            { label: '100s', value: 1 },
            { label: 'SR', value: 295.52 },
            { label: 'Avg', value: 66 },
          ],
        },
      },
      context: {
        tournament: { name: 'Pallandari Super League Season 3' },
      },
    });

    const props = PROCESSOR_MAP.BATSMAN_TOURNAMENT_LT(snapshot);
    const resolved = toBatsmanTournamentLt(props, tokens);

    expect(resolved?.batter.name).toBe('Taimoor Mirza');
    expect(resolved?.batter.tournamentLabel).toBe('Pallandari Super League Season 3');
    expect(resolved?.batter.matches).toBe(6);
    expect(resolved?.batter.runs).toBe(198);
    expect(resolved?.batter.fours).toBe(4);
    expect(resolved?.batter.sixes).toBe(27);
    expect(resolved?.batter.fifties).toBe(0);
    expect(resolved?.batter.hundreds).toBe(1);
    expect(resolved?.batter.sr).toBe(295.52);
    expect(resolved?.batter.avg).toBe(66);
  });

  it('maps bowler tournament processor output to BowlerTournamentLTBar shape', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BOWLER_TOURNAMENT_LT',
        payload: {
          user_id: 20,
          team_id: 2,
          player: { name: 'Itsham Satti', team: 'AWY', role: 'Bowler' },
          tournament_bowling: {
            matches: 4,
            overs: 6,
            wickets: 1,
            runs_conceded: 107,
            average: 107,
            economy: 17.83,
          },
          stats: [
            { label: 'Matches', value: 4 },
            { label: 'Overs', value: 6 },
            { label: 'Wkts', value: 1 },
            { label: 'Runs', value: 107 },
            { label: 'Avg', value: 107 },
            { label: 'Econ', value: 17.83 },
          ],
        },
      },
      context: {
        tournament: { name: 'Pallandari Super League Season 3' },
      },
    });

    const props = PROCESSOR_MAP.BOWLER_TOURNAMENT_LT(snapshot);
    const resolved = toBowlerTournamentLt(props, tokens);

    expect(resolved?.bowler.name).toBe('Itsham Satti');
    expect(resolved?.bowler.tournamentLabel).toBe('Pallandari Super League Season 3');
    expect(resolved?.bowler.w).toBe(1);
    expect(resolved?.bowler.wickets).toBe(1);
    expect(resolved?.bowler.r).toBe(107);
    expect(resolved?.bowler.overs).toBe('6');
    expect(resolved?.bowler.matches).toBe(4);
    expect(resolved?.bowler.avg).toBe(107);
    expect(resolved?.bowler.econ).toBe(17.83);
  });

  it('falls back to stats[] when tournament objects are absent', () => {
    const props = {
      playerName: 'Stats Only',
      playerTeam: 'HOM',
      teamCode: 'home',
      stats: [
        { label: 'Matches', value: 3 },
        { label: 'Runs', value: 88 },
        { label: '4s', value: 5 },
        { label: '6s', value: 2 },
        { label: '50s', value: 1 },
        { label: '100s', value: 0 },
        { label: 'SR', value: 142.5 },
      ],
    };

    const batsman = toBatsmanTournamentLt(props, tokens);
    expect(batsman?.batter.runs).toBe(88);
    expect(batsman?.batter.sr).toBe(142.5);

    const bowlerProps = {
      playerName: 'Stats Only Bowler',
      playerTeam: 'AWY',
      teamCode: 'away',
      stats: [
        { label: 'Matches', value: 2 },
        { label: 'Overs', value: '4.0' },
        { label: 'Wkts', value: 3 },
        { label: 'Runs', value: 45 },
        { label: 'Avg', value: 15 },
        { label: 'Econ', value: 11.25 },
      ],
    };

    const bowler = toBowlerTournamentLt(bowlerProps, tokens);
    expect(bowler?.bowler.wickets).toBe(3);
    expect(bowler?.bowler.overs).toBe('4.0');
    expect(bowler?.bowler.econ).toBe(11.25);
  });
});

describe('theme1 chart adapter', () => {
  const tokens = {
    homeBgColor: '#9b7bff',
    awayBgColor: '#f0a93c',
  };

  const inningsChart = [
    {
      team_name: 'Home XI',
      color_token: 'home',
      total_runs: 120,
      total_wickets: 3,
      display_overs: '15.2',
      fours: 10,
      sixes: 2,
      overs_breakdown: [
        { cumulative: 20, runs: 20 },
        { cumulative: 45, runs: 25 },
      ],
    },
    {
      team_name: 'Away XI',
      color_token: 'away',
      total_runs: 80,
      total_wickets: 2,
      display_overs: '12.0',
      fours: 5,
      sixes: 1,
      overs_breakdown: [
        { cumulative: 15, runs: 15 },
        { cumulative: 35, runs: 20 },
      ],
    },
  ];

  it('maps worm processor output to cumulative chart data', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WORM', display_mode: 'FS' },
      context: { innings_chart: inningsChart },
    });

    const props = PROCESSOR_MAP.WORM(snapshot);
    const chart = toWormChartData(props, tokens);

    expect(chart?.title).toBe('Worm');
    expect(chart?.chart.topSeries).toEqual([20, 45]);
    expect(chart?.chart.bottomSeries).toEqual([15, 35]);
    expect(chart?.meta.top.total).toBe('120/3');
    expect(chart?.teams.top.name).toBe('Home XI');
    expect(chart?.teams.bottom.name).toBe('Away XI');
    expect(chart?.teams.top.accent).toBe(tokens.homeBgColor);
    expect(chart?.teams.bottom.accent).toBe(tokens.awayBgColor);
    expect(chart?.sub).toContain('Pallandari');
  });

  it('maps manhattan processor output to phase chart data', () => {
    const phaseChart = [
      {
        team_name: 'Home XI',
        color_token: 'home',
        total_runs: 135,
        total_wickets: 3,
        display_overs: '6.0',
        fours: 1,
        sixes: 2,
        phase_stats: [
          { over_range: '1-4', runs: 85, wickets_in_phase: 3 },
          { over_range: '5-6', runs: 50, wickets_in_phase: 0 },
        ],
      },
      {
        team_name: 'Away XI',
        color_token: 'away',
        total_runs: 105,
        total_wickets: 0,
        display_overs: '6.0',
        fours: 0,
        sixes: 1,
        phase_stats: [
          { over_range: '1-4', runs: 96, wickets_in_phase: 0 },
          { over_range: '5-6', runs: 9, wickets_in_phase: 0 },
        ],
      },
    ];

    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MANHATTAN', display_mode: 'FS' },
      context: { innings_chart: phaseChart },
    });

    const props = PROCESSOR_MAP.MANHATTAN(snapshot);
    const chart = toPhaseChartData(props, tokens);

    expect(chart?.title).toBe('MANHATTAN');
    expect(chart?.chart.buckets).toHaveLength(2);
    expect(chart?.chart.buckets[0]).toEqual({ label: '1-4', top: 85, bottom: 96 });
    expect(chart?.chart.topWicketBadges).toEqual([{ bucketIndex: 0, value: 3 }]);
    expect(chart?.summary.top.score).toBe('135/3');
    expect(chart?.summary.top.name).toBe('Home XI');
    expect(chart?.summary.bottom.name).toBe('Away XI');
    expect(chart?.teams.top.name).toBe('Home XI');
    expect(chart?.teams.bottom.name).toBe('Away XI');
  });

  it('maps wicket badges for all phases that had wickets', () => {
    const phaseChart = [
      {
        team_name: 'Home XI',
        color_token: 'home',
        total_runs: 160,
        total_wickets: 5,
        display_overs: '6.0',
        fours: 2,
        sixes: 3,
        phase_stats: [
          { over_range: '1-4', runs: 90, wickets_in_phase: 3 },
          { over_range: '5-6', runs: 70, wickets_in_phase: 2 },
        ],
      },
      {
        team_name: 'Away XI',
        color_token: 'away',
        total_runs: 120,
        total_wickets: 1,
        display_overs: '6.0',
        fours: 1,
        sixes: 0,
        phase_stats: [
          { over_range: '1-4', runs: 80, wickets_in_phase: 0 },
          { over_range: '5-6', runs: 40, wickets_in_phase: 1 },
        ],
      },
    ];

    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MANHATTAN', display_mode: 'FS' },
      context: { innings_chart: phaseChart },
    });

    const props = PROCESSOR_MAP.MANHATTAN(snapshot);
    const chart = toPhaseChartData(props, tokens);

    expect(chart?.chart.topWicketBadges).toEqual([
      { bucketIndex: 0, value: 3 },
      { bucketIndex: 1, value: 2 },
    ]);
  });

  it('maps run rate processor output to per-over worm chart data', () => {
    const runRateChart = [
      {
        team_name: 'Home XI',
        color_token: 'home',
        total_runs: 120,
        total_wickets: 3,
        display_overs: '2.0',
        fours: 10,
        sixes: 2,
        overs_breakdown: [
          { cumulative: 60, runs: 60, run_rate: 10.0 },
          { cumulative: 120, runs: 60, run_rate: 12.0 },
        ],
      },
      {
        team_name: 'Away XI',
        color_token: 'away',
        total_runs: 80,
        total_wickets: 2,
        display_overs: '2.0',
        fours: 5,
        sixes: 1,
        overs_breakdown: [
          { cumulative: 40, runs: 40, run_rate: 8.0 },
          { cumulative: 80, runs: 40, run_rate: 9.0 },
        ],
      },
    ];

    const snapshot = createTestSnapshot({
      active_command: { command_key: 'RUN_RATE_CHART', display_mode: 'FS' },
      context: { innings_chart: runRateChart },
    });

    const props = PROCESSOR_MAP.RUN_RATE_CHART(snapshot);
    const chart = toWormChartData(props, tokens);

    expect(chart?.title).toBe('RUN RATE GRAPH');
    expect(chart?.chart.topSeries).toEqual([10, 12]);
    expect(chart?.chart.bottomSeries).toEqual([8, 9]);
    expect(chart?.chart.yLabel).toBe('Run Rate');
    expect(chart?.teams.top.name).toBe('Home XI');
    expect(chart?.teams.bottom.name).toBe('Away XI');
  });

  it('preserves null for unplayed overs so shorter innings line does not drop to zero', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WORM', display_mode: 'FS' },
      context: {
        innings_chart: [
          {
            team_name: 'Home XI',
            color_token: 'home',
            total_runs: 70,
            total_wickets: 3,
            display_overs: '5.0',
            fours: 4,
            sixes: 1,
            overs_breakdown: [
              { cumulative: 14, runs: 14 },
              { cumulative: 30, runs: 16 },
              { cumulative: 45, runs: 15 },
              { cumulative: 60, runs: 15 },
              { cumulative: 70, runs: 10 },
            ],
          },
          {
            team_name: 'Away XI',
            color_token: 'away',
            total_runs: 24,
            total_wickets: 1,
            display_overs: '1.2',
            fours: 1,
            sixes: 0,
            overs_breakdown: [
              { cumulative: 14, runs: 14 },
              { cumulative: 24, runs: 10 },
            ],
          },
        ],
      },
    });

    const props = PROCESSOR_MAP.WORM(snapshot);
    const chart = toWormChartData(props, tokens);

    // Full innings: all 5 values present
    expect(chart?.chart.topSeries).toEqual([14, 30, 45, 60, 70]);
    // Short innings: last 3 overs are null, not 0
    expect(chart?.chart.bottomSeries).toEqual([14, 24, null, null, null]);
  });

  it('maps innings-order teams when away bats first', () => {
    const awayFirstChart = [
      {
        team_name: 'Away XI',
        color_token: 'away',
        logo_url: 'https://example.com/away.png',
        total_runs: 90,
        total_wickets: 1,
        display_overs: '10.0',
        fours: 4,
        sixes: 1,
        overs_breakdown: [{ cumulative: 90, runs: 90 }],
      },
      {
        team_name: 'Home XI',
        color_token: 'home',
        logo_url: 'https://example.com/home.png',
        total_runs: 50,
        total_wickets: 2,
        display_overs: '8.0',
        fours: 2,
        sixes: 0,
        overs_breakdown: [{ cumulative: 50, runs: 50 }],
      },
    ];

    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WORM', display_mode: 'FS' },
      context: { innings_chart: awayFirstChart, batting_team: 'away' },
    });

    const props = PROCESSOR_MAP.WORM(snapshot);
    const chart = toWormChartData(props, tokens);

    expect(chart?.teams.top.name).toBe('Away XI');
    expect(chart?.teams.bottom.name).toBe('Home XI');
    expect(chart?.teams.top.logoUrl).toBe('https://example.com/away.png');
    expect(chart?.teams.top.accent).toBe(tokens.awayBgColor);
  });

  it('maps wagon wheel processor output to shot geometry data', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WAGON_WHEEL', display_mode: 'FS' },
      context: {
        match: { wagon_wheel_enabled: true },
        wagon_wheel_balls: [
          { type: 'runs', shot_direction: 'deep_cover', runs: 4, striker_id: 10 },
          { type: 'runs', shot_direction: 'long_on', runs: 6, striker_id: 11 },
        ],
      },
    });

    const props = PROCESSOR_MAP.WAGON_WHEEL(snapshot);
    const wheel = toWagonWheelData(props, tokens);

    expect(wheel?.title).toBe('WAGON WHEEL');
    expect(wheel?.shots).toHaveLength(2);
    expect(wheel?.shots[0].runs).toBe(4);
    expect(wheel?.shots[0].angle).toBe(22.5);
    expect(wheel?.shots[1].angle).toBe(-67.5);
    expect(typeof wheel?.shots[0].angle).toBe('number');
    expect(wheel?.shots[0].dist).toBeGreaterThan(0);
    expect(wheel?.zoneBreakdown).toEqual([
      { id: 'long_on', label: 'LONG ON', runs: 6, pct: 60 },
      { id: 'deep_cover', label: 'DEEP COVER', runs: 4, pct: 40 },
    ]);
  });
});

describe('theme1 squad adapter', () => {
  const tokens = {
    homeBgColor: '#9b7bff',
    awayBgColor: '#f0a93c',
  };

  it('maps batting squad processor output to squad bundle', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BATTING_SQUAD', display_mode: 'FS' },
      context: {
        squad_home: [
          { player_id: 1, name: 'Player One', role: 'batsman', is_captain: true },
          { player_id: 2, name: 'Player Two', role: 'bowler', is_wicket_keeper: true },
        ],
        batting_team: 'home',
      },
    });

    const props = PROCESSOR_MAP.BATTING_SQUAD(snapshot);
    const bundle = toSquadBundle(props, tokens, 'batting');

    expect(bundle?.data.title).toBe('Home XI');
    expect(bundle?.data.players).toHaveLength(2);
    expect(bundle?.data.players[0]).toMatchObject({ name: 'Player One', captain: true });
    expect(bundle?.data.players[1]).toMatchObject({ name: 'Player Two', wicketKeeper: true });
    expect(bundle?.teams.batting.color).toBe('#9b7bff');
    expect(bundle?.data.accent).toBe('#9b7bff');
    expect(bundle?.data.accentAlt).toBe('#f0a93c');
    expect(bundle?.teams.batting.code).toBeTruthy();
  });

  it('maps bowling squad with away team color when home is batting', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BOWLING_SQUAD', display_mode: 'FS' },
      context: {
        squad_away: [{ player_id: 3, name: 'Away Player', role: 'bowler' }],
        batting_team: 'home',
      },
    });

    const props = PROCESSOR_MAP.BOWLING_SQUAD(snapshot);
    const bundle = toSquadBundle(props, tokens, 'bowling');

    expect(props.teamSide).toBe('away');
    expect(bundle?.teams.bowling.color).toBe('#f0a93c');
    expect(bundle?.data.accentAlt).toBe('#9b7bff');
  });

  it('maps preview fixture shape to squad bundle', () => {
    const bundle = toSquadBundle(
      {
        title: 'SARDAR ONE KHAN CLUB',
        teamCode: 'soc',
        accent: '#9b7bff',
        players: [{ name: 'MIRZA', captain: true }],
      },
      tokens,
      'batting',
    );

    expect(bundle?.data.title).toBe('SARDAR ONE KHAN CLUB');
    expect(bundle?.teams.soc?.color).toBe('#9b7bff');
    expect(bundle?.data.players[0].name).toBe('MIRZA');
  });
});

describe('theme1 leaderboard adapter', () => {
  it('maps top batter processor output to leaderboard graphic data', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOP_BATTER', display_mode: 'FS' },
      context: {
        graphic_leaderboard_match_runs: [
          { rank: 1, runs: 85, name: 'Star Batter', team: 'HOM', is_not_out: true },
          { rank: 2, runs: 62, name: 'Other Batter', team: 'AWY', is_not_out: false },
        ],
      },
    });

    const props = PROCESSOR_MAP.TOP_BATTER(snapshot);
    const leaderboard = toLeaderboardData(props);

    expect(leaderboard?.title).toBe('Top Batter');
    expect(leaderboard?.data.rows).toHaveLength(2);
    expect(leaderboard?.data.rows[0]).toMatchObject({
      rank: 1,
      name: 'Star Batter',
      club: 'HOM',
      value: 85,
      isNotOut: true,
    });
    expect(leaderboard?.data.featured?.name).toBe('Star Batter');
  });

  it('formats three-part player names for broadcast (max two words)', () => {
    const leaderboard = toLeaderboardData({
      commandKey: 'TOP_BATTER',
      rows: [{ rank: 1, runs: 42, name: 'Waqar Saleem Bhatti', team: 'HOM' }],
    });

    expect(leaderboard?.data.rows[0]?.name).toBe('Waqar Saleem');
    expect(leaderboard?.data.featured?.name).toBe('Waqar Saleem');
  });
});

describe('theme1 fallOfWickets adapter', () => {
  const tokens = {
    homeBgColor: '#9b7bff',
    awayBgColor: '#f0a93c',
  };

  it('maps FOW processor output to fall of wickets LT data', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'FOW' },
      context: {
        fall_of_wickets: [
          { number: '1', score: '22', batsman_display_name: 'Player A' },
          { number: '2', score: '55', batsman_display_name: 'Player B' },
        ],
        score: '105-2',
        overs: '12.0',
        batting_team: 'home',
      },
    });

    const props = PROCESSOR_MAP.FOW(snapshot);
    const fow = toFallOfWicketsData(props, tokens);

    expect(fow?.data.total).toBe(105);
    expect(fow?.data.wkts).toBe(2);
    expect(fow?.data.wickets).toHaveLength(2);
    expect(fow?.data.wickets[0]).toMatchObject({ number: '1', score: '22', batter: 'Player A' });
    expect(fow?.data.oversText).toBe('12.0 OVER');
    expect(fow?.teams?.home?.code).toBe('HOM');
  });
});

describe('theme1 playing11 adapter', () => {
  it('maps preview fixture teams array with hex accents', () => {
    const bundle = toPlaying11Bundle({
      sub: 'PALLANDARI SUPER LEAGUE SEASON 3',
      requiredRR: '26.57',
      teams: [
        {
          teamCode: 'fcm',
          name: 'FRIENDS CLUB MANGRIOT',
          accent: '#f0a93c',
          players: ['WAQAR NAZ', 'ITSHAM SATTI (C)'],
        },
        {
          teamCode: 'soc',
          name: 'SARDAR ONE KHAN',
          accent: '#9b7bff',
          players: ['SAYYAM IMTIAZ', 'TAIMOOR MIRZA (C) (WK)'],
        },
      ],
    });

    expect(bundle?.data?.teams?.[0]?.accent).toBe('#f0a93c');
    expect(bundle?.data?.teams?.[1]?.accent).toBe('#9b7bff');
    expect(bundle?.teams?.fcm?.color).toBe('#f0a93c');
  });

  it('falls back to theme accents when live team colors are empty strings', () => {
    const bundle = toPlaying11Bundle(
      {
        homeTeam: { name: 'Peshawar Zalmi', players: [{ name: 'Player A' }] },
        awayTeam: { name: 'Multan Sultans', players: [{ name: 'Player B' }] },
      },
      {
        homeBgColor: '',
        awayBgColor: '',
        homeTextColor: '',
        awayTextColor: '',
      },
    );

    expect(bundle?.data?.teams?.[0]?.accent).toBe('var(--accentA)');
    expect(bundle?.data?.teams?.[1]?.accent).toBe('var(--accentB)');
  });

  it('builds bundle from squad-shaped players with display_name', () => {
    const bundle = toPlaying11Bundle({
      homeTeam: { name: 'Home XI', players: [{ display_name: 'Batter A', is_captain: true }] },
      awayTeam: { name: 'Away XI', players: [{ display_name: 'Batter B' }] },
      tournamentLabel: 'Demo League',
    });

    expect(bundle?.data?.teams).toHaveLength(2);
    expect(bundle?.data?.teams?.[0]?.players).toEqual(['Batter A (C)']);
    expect(bundle?.data?.teams?.[1]?.players).toEqual(['Batter B']);
  });
});

describe('theme1 adapter gaps', () => {
  const tokens = {
    homeTextColor: '#fff',
    homeBgColor: '#0055ff',
    awayTextColor: '#fff',
    awayBgColor: '#ff5500',
    enableImages: true,
  };

  it('toBowlingSummaryBundle maps bowlers and score strip', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BOWLING_SUMMARY' },
      context: {
        bowlers: [{ name: 'Bowler One', overs: '4.0', figures: '2/28' }],
      },
    });
    const props = PROCESSOR_MAP.BOWLING_SUMMARY(snapshot);
    const bundle = toBowlingSummaryBundle(props, tokens);

    expect(bundle?.data?.bowlers).toHaveLength(1);
    expect(bundle?.data?.scoreStrip?.total).toBe('120-3');
    expect(bundle?.data?.title).toBeTruthy();
  });

  it('toInningFiguresBundle maps innings summary fields', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'INNING_FIGURES' } });
    const props = PROCESSOR_MAP.INNING_FIGURES(snapshot);
    const bundle = toInningFiguresBundle(props, tokens);

    expect(bundle?.data?.score).toBeTruthy();
    expect(bundle?.data?.innings).toBe('1ST');
    expect(bundle?.data?.title).toContain('VS');
  });

  it('toNeedTargetBundle maps chase target fields', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'NEED_TARGET_FS', display_mode: 'FS' } });
    const props = PROCESSOR_MAP.NEED_TARGET_FS(snapshot);
    const bundle = toNeedTargetBundle(props, tokens);

    expect(bundle?.data?.runsNeeded).toBe(61);
    expect(bundle?.data?.ballsRemaining).toBe(28);
    expect(bundle?.data?.title).toContain('TO WIN');
  });

  it('toMomPlayer maps award headline and role from enriched payload', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'MOM',
        payload: {
          user_id: 10,
          player: { name: 'Star Player', team: 'HOM', role: 'All-rounder' },
          headline: 'Player of the Match',
        },
      },
    });
    const props = PROCESSOR_MAP.MOM(snapshot);
    const bundle = toMomPlayer(props, tokens);

    expect(bundle?.player?.name).toBe('Star Player');
    expect(bundle?.player?.awardLine).toBe('Match Award');
    expect(bundle?.player?.role).toBe('All-rounder');
  });

  it('toMomPlayer resolves player from match player_of_match when payload is empty', () => {
    const snapshot = createTestSnapshot({
      context: {
        match: {
          player_of_match_user_id: 10,
          player_of_match_name: 'Star Player',
        },
      },
      active_command: {
        command_key: 'MOM',
        payload: {
          user_id: 10,
          player: { name: 'Star Player', team: 'HOM', role: 'All-rounder' },
        },
      },
    });
    const props = PROCESSOR_MAP.MOM(snapshot);
    const bundle = toMomPlayer(props, tokens);

    expect(bundle?.player?.name).toBe('Star Player');
  });

  it('toPlayer shows team short code in crest when logo is missing', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_NAME_FS',
        payload: {
          user_id: 10,
          team_id: 1,
          player: { name: 'Star Batter', role: 'Batter' },
        },
      },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Islamabad United',
          away_team_name: 'Lahore Qalandars',
          home_team_short_code: 'IU',
          away_team_short_code: 'LQ',
          home_team_logo_url: null,
        },
      },
    });
    const props = PROCESSOR_MAP.BATSMAN_NAME_FS(snapshot);
    const bundle = toPlayer(props, tokens);

    expect(bundle?.teams.home.code).toBe('IU');
    expect(bundle?.player.teamCode).toBe('home');
  });

  it('toPlayer resolves short code for NAME_LT and BOWLER_MATCH_FS without logo', () => {
    const baseContext = {
      match: {
        home_team_id: 1,
        away_team_id: 2,
        home_team_name: 'Islamabad United',
        away_team_name: 'Lahore Qalandars',
        home_team_short_code: 'IU',
        away_team_short_code: 'LQ',
        home_team_logo_url: null,
        away_team_logo_url: null,
      },
    };

    const ltProps = PROCESSOR_MAP.BATSMAN_NAME_LT(
      createTestSnapshot({
        active_command: {
          command_key: 'BATSMAN_NAME_LT',
          payload: { user_id: 10, team_id: 1, player: { name: 'Star Batter' } },
        },
        context: baseContext,
      }),
    );
    expect(toPlayer(ltProps, tokens)?.teams.home.code).toBe('IU');

    const bowlerFsProps = PROCESSOR_MAP.BOWLER_MATCH_FS(
      createTestSnapshot({
        active_command: {
          command_key: 'BOWLER_MATCH_FS',
          payload: { user_id: 20, team_id: 2, player: { name: 'Bowler One' } },
        },
        context: baseContext,
      }),
    );
    expect(toPlayer(bowlerFsProps, tokens)?.teams.away.code).toBe('LQ');
  });

  it('toWormChartData keeps team short names when logos are missing', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WORM', display_mode: 'FS' },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Islamabad United',
          away_team_name: 'Lahore Qalandars',
          home_team_short_code: 'IU',
          away_team_short_code: 'LQ',
          home_team_logo_url: null,
          away_team_logo_url: null,
        },
        innings_chart: [
          {
            team_name: 'Islamabad United',
            color_token: 'home',
            logo_url: null,
            total_runs: 120,
            total_wickets: 3,
            display_overs: '15.2',
            overs_breakdown: [
              { cumulative: 20, runs: 20 },
              { cumulative: 45, runs: 25 },
            ],
          },
          {
            team_name: 'Lahore Qalandars',
            color_token: 'away',
            logo_url: null,
            total_runs: 80,
            total_wickets: 2,
            display_overs: '12.0',
            overs_breakdown: [
              { cumulative: 15, runs: 15 },
              { cumulative: 35, runs: 20 },
            ],
          },
        ],
      },
    });
    const props = PROCESSOR_MAP.WORM(snapshot);
    const chart = toWormChartData(props, tokens);

    expect(chart?.teams.top.shortName).toBe('IU');
    expect(chart?.teams.bottom.shortName).toBe('LQ');
    expect(chart?.teams.top.logoUrl).toBeNull();
  });

  it('preview last wicket batter uses team short code when logo is missing', () => {
    const bundle = toLastWicketFsBatter(
      {
        firstName: 'Star',
        lastName: 'Batter',
        teamCode: 'home',
        homeTeam: { name: 'Islamabad United', shortCode: 'IU', logoUrl: null },
        awayTeam: { name: 'Lahore Qalandars', shortCode: 'LQ', logoUrl: null },
      },
      tokens,
    );

    expect(bundle?.teams.home.code).toBe('IU');
    expect(bundle?.batter.teamCode).toBe('home');
  });

  it('toCustomCaptionData uppercases title and description', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'CUSTOM', payload: { title: 'Hello', description: 'World' } },
    });
    const props = PROCESSOR_MAP.CUSTOM(snapshot);

    expect(toCustomCaptionData(props)).toEqual({ title: 'HELLO', description: 'WORLD' });
  });

  it('formatLiveFromVenueLine normalises LIVE FROM prefix', () => {
    expect(formatLiveFromVenueLine({ venueDisplayLine: 'National Stadium' })).toBe('LIVE FROM National Stadium');
    expect(formatLiveFromVenueLine({ venueDisplayLine: 'Live From Karachi' })).toBe('Live From Karachi');
    expect(formatLiveFromVenueLine({ venue: 'Gaddafi Stadium' })).toBe('LIVE FROM Gaddafi Stadium');
    expect(formatLiveFromVenueLine({})).toBeNull();
  });
});
