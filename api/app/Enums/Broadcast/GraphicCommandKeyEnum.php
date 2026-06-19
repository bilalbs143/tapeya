<?php

namespace App\Enums\Broadcast;

/**
 * All graphics command keys; grouped by {@see commandType()} for the match controller UI and API validation.
 * Case order matches the default command order within each controller group.
 */
enum GraphicCommandKeyEnum: string
{
    // --- Lower Third ---
    case LT_EMPTY = 'LT_EMPTY';
    case LT_DEFAULT = 'LT_DEFAULT';
    case MINI_SCORECARD = 'MINI_SCORECARD';
    case MATCH_SUMMARY = 'MATCH_SUMMARY';
    case INTRO_LT = 'INTRO_LT';
    case TOSS_LT = 'TOSS_LT';
    case NEED_TARGET = 'NEED_TARGET';
    case AT_STAGE = 'AT_STAGE';
    case RUN_RATE = 'RUN_RATE';
    case THIS_OVER = 'THIS_OVER';
    case PREVIOUS_OVER = 'PREVIOUS_OVER';
    case FOW = 'FOW';
    case LAST_WICKET = 'LAST_WICKET';
    case LAST_12_BALLS = 'LAST_12_BALLS';
    case LAST_30_BALLS = 'LAST_30_BALLS';
    case CURRENT_PARTNERSHIP = 'CURRENT_PARTNERSHIP';
    case TOURNAMENT_NAME = 'TOURNAMENT_NAME';
    case RESULT_LT = 'RESULT_LT';
    case WIN_PREDICTION = 'WIN_PREDICTION';
    case LT_FOUR = 'LT_FOUR';
    case LT_SIX = 'LT_SIX';
    case LT_WIDE = 'LT_WIDE';
    case LT_NO_BALL = 'LT_NO_BALL';
    case LT_NOT_OUT = 'LT_NOT_OUT';
    case LT_OUT = 'LT_OUT';
    case FIFTY_UP = 'FIFTY_UP';
    case HUNDRED_UP = 'HUNDRED_UP';
    case LT_REPLAY = 'LT_REPLAY';
    case DECISION_PENDING = 'DECISION_PENDING';
    case UMPIRES = 'UMPIRES';
    case SCORERS = 'SCORERS';
    case COMMENTATORS = 'COMMENTATORS';
    case FOLLOW_PLATFORM = 'FOLLOW_PLATFORM';
    case DOWNLOAD_PLATFORM = 'DOWNLOAD_PLATFORM';

    // --- Full Screen ---
    case THIS_MATCH = 'THIS_MATCH';
    case PLAYING_11 = 'PLAYING_11';
    case BATTING_SQUAD = 'BATTING_SQUAD';
    case BOWLING_SQUAD = 'BOWLING_SQUAD';
    case NEXT_MATCH = 'NEXT_MATCH';
    case LAST_WICKET_FS = 'LAST_WICKET_FS';
    case CURRENT_PARTNERSHIP_FS = 'CURRENT_PARTNERSHIP_FS';
    case PARTNERSHIP_LIST = 'PARTNERSHIP_LIST';
    case NEED_TARGET_FS = 'NEED_TARGET_FS';
    case BATTING_SUMMARY = 'BATTING_SUMMARY';
    case BOWLING_SUMMARY = 'BOWLING_SUMMARY';
    case MATCH_SUMMARY_FS = 'MATCH_SUMMARY_FS';
    case TOP_BOWLER = 'TOP_BOWLER';
    case TOP_BATTER = 'TOP_BATTER';
    case INNING_FIGURES = 'INNING_FIGURES';
    case MOM = 'MOM';

    // --- Tour Hits ---
    case TOUR_FOURS = 'TOUR_FOURS';
    case TOUR_SIXES = 'TOUR_SIXES';
    case TOUR_FIFTIES = 'TOUR_FIFTIES';
    case TOUR_HUNDREDS = 'TOUR_HUNDREDS';
    case TOUR_RUNS = 'TOUR_RUNS';
    case TOUR_WICKETS = 'TOUR_WICKETS';

    // --- Full Screen Transitions ---
    case FST_FOUR = 'FST_FOUR';
    case FST_SIX = 'FST_SIX';
    case FST_NOT_OUT = 'FST_NOT_OUT';
    case FST_OUT = 'FST_OUT';
    case FST_NO_BALL = 'FST_NO_BALL';
    case FST_WIDE = 'FST_WIDE';
    case FST_FIFTY = 'FST_FIFTY';
    case FST_HUNDRED = 'FST_HUNDRED';
    case FST_REPLAY = 'FST_REPLAY';
    case FST_DECISION = 'FST_DECISION';

    // --- Breaks ---
    case INNINGS_BREAK = 'INNINGS_BREAK';
    case TEA_BREAK = 'TEA_BREAK';
    case LUNCH_BREAK = 'LUNCH_BREAK';
    case RAIN_STOPPED = 'RAIN_STOPPED';
    case STRATEGIC_TIMEOUT = 'STRATEGIC_TIMEOUT';

    // --- Tournament ---
    case POINT_TABLE = 'POINT_TABLE';
    case HIGHEST_RUNS = 'HIGHEST_RUNS';
    case HIGHEST_WICKETS = 'HIGHEST_WICKETS';
    case HIGHEST_SIXES = 'HIGHEST_SIXES';
    case HIGHEST_FOURS = 'HIGHEST_FOURS';

    // --- Charts ---
    case WORM = 'WORM';
    case RUN_RATE_CHART = 'RUN_RATE_CHART';
    case MANHATTAN = 'MANHATTAN';
    case WAGON_WHEEL = 'WAGON_WHEEL';

    // --- Player Stats: Batsman ---
    case BATSMAN_NAME_LT = 'BATSMAN_NAME_LT';
    case BATSMAN_NAME_FS = 'BATSMAN_NAME_FS';
    case BATSMAN_MATCH_LT = 'BATSMAN_MATCH_LT';
    case BATSMAN_MATCH_FS = 'BATSMAN_MATCH_FS';
    case BATSMAN_TOURNAMENT_LT = 'BATSMAN_TOURNAMENT_LT';
    case BATSMAN_TOURNAMENT_FS = 'BATSMAN_TOURNAMENT_FS';
    case BATSMAN_WAGON_WHEEL = 'BATSMAN_WAGON_WHEEL';

    // --- Player Stats: Bowler ---
    case BOWLER_NAME_LT = 'BOWLER_NAME_LT';
    case BOWLER_NAME_FS = 'BOWLER_NAME_FS';
    case BOWLER_MATCH_LT = 'BOWLER_MATCH_LT';
    case BOWLER_MATCH_FS = 'BOWLER_MATCH_FS';
    case BOWLER_TOURNAMENT_LT = 'BOWLER_TOURNAMENT_LT';
    case BOWLER_TOURNAMENT_FS = 'BOWLER_TOURNAMENT_FS';

    // --- Custom Message / Caption ---
    case CUSTOM = 'CUSTOM';
    case ADD_CAPTION = 'ADD_CAPTION';

    public function commandType(): GraphicCommandTypeEnum
    {
        return match ($this) {
            self::LT_EMPTY,
            self::LT_DEFAULT,
            self::MINI_SCORECARD,
            self::MATCH_SUMMARY,
            self::INTRO_LT,
            self::TOSS_LT,
            self::NEED_TARGET,
            self::AT_STAGE,
            self::RUN_RATE,
            self::THIS_OVER,
            self::PREVIOUS_OVER,
            self::FOW,
            self::LAST_WICKET,
            self::LAST_12_BALLS,
            self::LAST_30_BALLS,
            self::CURRENT_PARTNERSHIP,
            self::TOURNAMENT_NAME,
            self::RESULT_LT,
            self::WIN_PREDICTION,
            self::LT_FOUR,
            self::LT_SIX,
            self::LT_WIDE,
            self::LT_NO_BALL,
            self::LT_NOT_OUT,
            self::LT_OUT,
            self::FIFTY_UP,
            self::HUNDRED_UP,
            self::LT_REPLAY,
            self::DECISION_PENDING,
            self::UMPIRES,
            self::SCORERS,
            self::COMMENTATORS,
            self::FOLLOW_PLATFORM,
            self::DOWNLOAD_PLATFORM => GraphicCommandTypeEnum::LOWER_THIRD,

            self::THIS_MATCH,
            self::PLAYING_11,
            self::BATTING_SQUAD,
            self::BOWLING_SQUAD,
            self::NEXT_MATCH,
            self::LAST_WICKET_FS,
            self::CURRENT_PARTNERSHIP_FS,
            self::PARTNERSHIP_LIST,
            self::NEED_TARGET_FS,
            self::BATTING_SUMMARY,
            self::BOWLING_SUMMARY,
            self::MATCH_SUMMARY_FS,
            self::TOP_BOWLER,
            self::TOP_BATTER,
            self::INNING_FIGURES,
            self::MOM => GraphicCommandTypeEnum::FULL_SCREEN,

            self::TOUR_FOURS,
            self::TOUR_SIXES,
            self::TOUR_FIFTIES,
            self::TOUR_HUNDREDS,
            self::TOUR_RUNS,
            self::TOUR_WICKETS => GraphicCommandTypeEnum::TOUR_HITS,

            self::FST_FOUR,
            self::FST_SIX,
            self::FST_NOT_OUT,
            self::FST_OUT,
            self::FST_NO_BALL,
            self::FST_WIDE,
            self::FST_FIFTY,
            self::FST_HUNDRED,
            self::FST_REPLAY,
            self::FST_DECISION => GraphicCommandTypeEnum::FULL_SCREEN_TRANSITION,

            self::INNINGS_BREAK,
            self::TEA_BREAK,
            self::LUNCH_BREAK,
            self::RAIN_STOPPED,
            self::STRATEGIC_TIMEOUT => GraphicCommandTypeEnum::BREAK,

            self::POINT_TABLE,
            self::HIGHEST_RUNS,
            self::HIGHEST_WICKETS,
            self::HIGHEST_SIXES,
            self::HIGHEST_FOURS => GraphicCommandTypeEnum::TOURNAMENT,

            self::WORM,
            self::RUN_RATE_CHART,
            self::MANHATTAN,
            self::WAGON_WHEEL => GraphicCommandTypeEnum::CHART,

            self::BATSMAN_NAME_LT,
            self::BATSMAN_NAME_FS,
            self::BATSMAN_MATCH_LT,
            self::BATSMAN_MATCH_FS,
            self::BATSMAN_TOURNAMENT_LT,
            self::BATSMAN_TOURNAMENT_FS,
            self::BATSMAN_WAGON_WHEEL => GraphicCommandTypeEnum::BATSMAN_STATS,

            self::BOWLER_NAME_LT,
            self::BOWLER_NAME_FS,
            self::BOWLER_MATCH_LT,
            self::BOWLER_MATCH_FS,
            self::BOWLER_TOURNAMENT_LT,
            self::BOWLER_TOURNAMENT_FS => GraphicCommandTypeEnum::BOWLER_STATS,

            self::CUSTOM,
            self::ADD_CAPTION => GraphicCommandTypeEnum::CAPTION,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::LT_EMPTY => 'Empty',
            self::LT_DEFAULT => 'Default',
            self::MINI_SCORECARD => 'Mini ScoreCard',
            self::MATCH_SUMMARY => 'Match Summary',
            self::INTRO_LT => 'Intro LT',
            self::TOSS_LT => 'Toss LT',
            self::NEED_TARGET => 'Need/Target',
            self::AT_STAGE => 'At Stage',
            self::RUN_RATE => 'Run Rate',
            self::THIS_OVER => 'This Over',
            self::PREVIOUS_OVER => 'Previous Over',
            self::FOW => 'FOW',
            self::LAST_WICKET => 'Last Wicket',
            self::LAST_12_BALLS => 'Last 12 Balls',
            self::LAST_30_BALLS => 'Last 30 Balls',
            self::CURRENT_PARTNERSHIP => 'Current Partnership',
            self::TOURNAMENT_NAME => 'Tournament Name',
            self::RESULT_LT => 'Result LT',
            self::WIN_PREDICTION => 'Win Prediction',
            self::LT_FOUR => '4',
            self::LT_SIX => '6',
            self::LT_WIDE => 'Wide',
            self::LT_NO_BALL => 'No-Ball',
            self::LT_NOT_OUT => 'Not Out',
            self::LT_OUT => 'Out',
            self::FIFTY_UP => '50 Up',
            self::HUNDRED_UP => '100 Up',
            self::LT_REPLAY => 'Replay',
            self::DECISION_PENDING => 'Decision Pending',
            self::UMPIRES => 'Umpires',
            self::SCORERS => 'Scorers',
            self::COMMENTATORS => 'Commentators',
            self::FOLLOW_PLATFORM => 'Follow Tapeya',
            self::DOWNLOAD_PLATFORM => 'Download Tapeya',

            self::THIS_MATCH => 'This Match',
            self::PLAYING_11 => 'Playing 11',
            self::BATTING_SQUAD => 'Batting Squad',
            self::BOWLING_SQUAD => 'Bowling Squad',
            self::NEXT_MATCH => 'Next Match',
            self::LAST_WICKET_FS => 'Last Wicket',
            self::CURRENT_PARTNERSHIP_FS => 'Current Partnership',
            self::PARTNERSHIP_LIST => 'Partnership List',
            self::NEED_TARGET_FS => 'Need/Target',
            self::BATTING_SUMMARY => 'Batting Summary',
            self::BOWLING_SUMMARY => 'Bowling Summary',
            self::MATCH_SUMMARY_FS => 'Match Summary',
            self::TOP_BOWLER => 'Top Bowler',
            self::TOP_BATTER => 'Top Batter',
            self::INNING_FIGURES => 'Inning Figures',
            self::MOM => 'MOM',

            self::TOUR_FOURS => "4's",
            self::TOUR_SIXES => "6's",
            self::TOUR_FIFTIES => "50's",
            self::TOUR_HUNDREDS => "100's",
            self::TOUR_RUNS => "Run's",
            self::TOUR_WICKETS => "Wkt's",

            self::FST_FOUR => '4',
            self::FST_SIX => '6',
            self::FST_NOT_OUT => 'Not Out',
            self::FST_OUT => 'Out',
            self::FST_NO_BALL => 'No Ball',
            self::FST_WIDE => 'Wide',
            self::FST_FIFTY => '50',
            self::FST_HUNDRED => '100',
            self::FST_REPLAY => 'Replay',
            self::FST_DECISION => 'Decision Pending',

            self::INNINGS_BREAK => 'Innings Break',
            self::TEA_BREAK => 'Tea Break',
            self::LUNCH_BREAK => 'Lunch Break',
            self::RAIN_STOPPED => 'Rain Stopped',
            self::STRATEGIC_TIMEOUT => 'Strategic Timeout',

            self::POINT_TABLE => 'Point Table',
            self::HIGHEST_RUNS => 'Highest Runs',
            self::HIGHEST_WICKETS => 'Highest Wickets',
            self::HIGHEST_SIXES => 'Highest Sixes',
            self::HIGHEST_FOURS => 'Highest Fours',

            self::WORM => 'Worm Chart',
            self::RUN_RATE_CHART => 'Run Rate',
            self::MANHATTAN => 'Manhatt',
            self::WAGON_WHEEL => 'Wagon Wheel',

            self::BATSMAN_NAME_LT => 'Name LT',
            self::BATSMAN_NAME_FS => 'Name FS',
            self::BATSMAN_MATCH_LT => 'Match LT',
            self::BATSMAN_MATCH_FS => 'Match FS',
            self::BATSMAN_TOURNAMENT_LT => 'Tournament LT',
            self::BATSMAN_TOURNAMENT_FS => 'Tournament FS',
            self::BATSMAN_WAGON_WHEEL => 'Player Wagon Wheel',

            self::BOWLER_NAME_LT => 'Name LT',
            self::BOWLER_NAME_FS => 'Name FS',
            self::BOWLER_MATCH_LT => 'Match LT',
            self::BOWLER_MATCH_FS => 'Match FS',
            self::BOWLER_TOURNAMENT_LT => 'Tournament LT',
            self::BOWLER_TOURNAMENT_FS => 'Tournament FS',

            self::CUSTOM => 'Custom Message',
            self::ADD_CAPTION => 'Add Caption',
        };
    }

    public function displayMode(): GraphicCommandDisplayModeEnum
    {
        return match ($this) {
            self::LT_EMPTY,
            self::LT_DEFAULT,
            self::MINI_SCORECARD,
            self::MATCH_SUMMARY,
            self::INTRO_LT,
            self::TOSS_LT,
            self::NEED_TARGET,
            self::AT_STAGE,
            self::RUN_RATE,
            self::THIS_OVER,
            self::PREVIOUS_OVER,
            self::FOW,
            self::LAST_WICKET,
            self::LAST_12_BALLS,
            self::LAST_30_BALLS,
            self::CURRENT_PARTNERSHIP,
            self::TOURNAMENT_NAME,
            self::RESULT_LT,
            self::WIN_PREDICTION,
            self::LT_FOUR,
            self::LT_SIX,
            self::LT_WIDE,
            self::LT_NO_BALL,
            self::LT_NOT_OUT,
            self::LT_OUT,
            self::FIFTY_UP,
            self::HUNDRED_UP,
            self::LT_REPLAY,
            self::DECISION_PENDING,
            self::UMPIRES,
            self::SCORERS,
            self::COMMENTATORS,
            self::FOLLOW_PLATFORM,
            self::DOWNLOAD_PLATFORM,
            self::CUSTOM,
            self::ADD_CAPTION,
            self::BATSMAN_NAME_LT,
            self::BATSMAN_MATCH_LT,
            self::BATSMAN_TOURNAMENT_LT,
            self::BOWLER_NAME_LT,
            self::BOWLER_MATCH_LT,
            self::BOWLER_TOURNAMENT_LT,
            self::TOUR_FOURS,
            self::TOUR_SIXES,
            self::TOUR_FIFTIES,
            self::TOUR_HUNDREDS,
            self::TOUR_RUNS,
            self::TOUR_WICKETS => GraphicCommandDisplayModeEnum::LT,

            self::BATSMAN_NAME_FS,
            self::BATSMAN_MATCH_FS,
            self::BATSMAN_TOURNAMENT_FS,
            self::BATSMAN_WAGON_WHEEL,
            self::BOWLER_NAME_FS,
            self::BOWLER_MATCH_FS,
            self::BOWLER_TOURNAMENT_FS => GraphicCommandDisplayModeEnum::FS,

            default => GraphicCommandDisplayModeEnum::FS,
        };
    }
}
