<?php

use App\Services\PlayerStatsService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Hard-remove cricket_format from matches + career stats tables.
 * Merges duplicate (player_id, tournament_type) rows that differed only by format.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->mergeBattingStats();
        $this->mergeBowlingStats();
        $this->mergeFieldingStats();

        $this->dropFormatFromStatsTable('player_batting_stats');
        $this->dropFormatFromStatsTable('player_bowling_stats');
        $this->dropFormatFromStatsTable('player_fielding_stats');

        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn('cricket_format');
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->string('cricket_format', 30)->nullable()->after('created_by');
        });

        foreach (['player_batting_stats', 'player_bowling_stats', 'player_fielding_stats'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropUnique(['player_id', 'tournament_type']);
                $table->dropIndex(['tournament_type']);
                $table->string('cricket_format', 30)->default('all')->after('tournament_type');
                $table->unique(['player_id', 'tournament_type', 'cricket_format']);
                $table->index(['tournament_type', 'cricket_format']);
            });
        }
    }

    private function dropFormatFromStatsTable(string $tableName): void
    {
        Schema::table($tableName, function (Blueprint $table) {
            $table->dropUnique(['player_id', 'tournament_type', 'cricket_format']);
            $table->dropIndex(['tournament_type', 'cricket_format']);
            $table->dropColumn('cricket_format');
            $table->unique(['player_id', 'tournament_type']);
            $table->index(['tournament_type']);
        });
    }

    private function mergeBattingStats(): void
    {
        $groups = DB::table('player_batting_stats')
            ->select('player_id', 'tournament_type')
            ->groupBy('player_id', 'tournament_type')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($groups as $group) {
            $rows = DB::table('player_batting_stats')
                ->where('player_id', $group->player_id)
                ->where('tournament_type', $group->tournament_type)
                ->orderBy('id')
                ->get();

            $keepId = (int) $rows->first()->id;
            $innings = (int) $rows->sum('innings');
            $notOuts = (int) $rows->sum('not_outs');
            $runs = (int) $rows->sum('runs');
            $ballsFaced = (int) $rows->sum('balls_faced');
            $dismissals = max(0, $innings - $notOuts);

            $highest = $rows
                ->sortByDesc(fn ($row) => (int) rtrim((string) $row->highest_score, '*'))
                ->first()
                ?->highest_score ?? '0';

            DB::table('player_batting_stats')->where('id', $keepId)->update([
                'matches' => (int) $rows->sum('matches'),
                'innings' => $innings,
                'not_outs' => $notOuts,
                'runs' => $runs,
                'balls_faced' => $ballsFaced,
                'fours' => (int) $rows->sum('fours'),
                'sixes' => (int) $rows->sum('sixes'),
                'dots' => (int) $rows->sum('dots'),
                'highest_score' => $highest,
                'hundreds' => (int) $rows->sum('hundreds'),
                'fifties' => (int) $rows->sum('fifties'),
                'average' => $dismissals > 0 ? round($runs / $dismissals, 2) : null,
                'strike_rate' => $ballsFaced > 0 ? round(100 * $runs / $ballsFaced, 2) : null,
                'updated_at' => now(),
            ]);

            DB::table('player_batting_stats')
                ->where('player_id', $group->player_id)
                ->where('tournament_type', $group->tournament_type)
                ->where('id', '!=', $keepId)
                ->delete();
        }
    }

    private function mergeBowlingStats(): void
    {
        $groups = DB::table('player_bowling_stats')
            ->select('player_id', 'tournament_type')
            ->groupBy('player_id', 'tournament_type')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($groups as $group) {
            $rows = DB::table('player_bowling_stats')
                ->where('player_id', $group->player_id)
                ->where('tournament_type', $group->tournament_type)
                ->orderBy('id')
                ->get();

            $keepId = (int) $rows->first()->id;
            $runsConceded = (int) $rows->sum('runs_conceded');
            $wickets = (int) $rows->sum('wickets');
            // Cricket overs are not decimal: 1.5 + 1.5 = 3.4 (20 balls), not 3.0.
            $legalBalls = (int) $rows->sum(
                fn ($row) => PlayerStatsService::legalBallsFromCricketOvers((float) $row->overs)
            );
            $overs = PlayerStatsService::oversFromLegalBalls($legalBalls);

            DB::table('player_bowling_stats')->where('id', $keepId)->update([
                'matches' => (int) $rows->sum('matches'),
                'innings' => (int) $rows->sum('innings'),
                'overs' => $overs,
                'maidens' => (int) $rows->sum('maidens'),
                'runs_conceded' => $runsConceded,
                'wickets' => $wickets,
                'no_balls' => (int) $rows->sum('no_balls'),
                'wides' => (int) $rows->sum('wides'),
                'best_bowling_innings' => $this->pickBestFigure($rows->pluck('best_bowling_innings')->all()),
                'best_bowling_match' => $this->pickBestFigure($rows->pluck('best_bowling_match')->all()),
                'five_wickets' => (int) $rows->sum('five_wickets'),
                'ten_wickets' => (int) $rows->sum('ten_wickets'),
                'average' => $wickets > 0 ? round($runsConceded / $wickets, 2) : null,
                'economy' => PlayerStatsService::bowlingEconomy($runsConceded, $legalBalls),
                'strike_rate' => PlayerStatsService::bowlingStrikeRate($legalBalls, $wickets),
                'updated_at' => now(),
            ]);

            DB::table('player_bowling_stats')
                ->where('player_id', $group->player_id)
                ->where('tournament_type', $group->tournament_type)
                ->where('id', '!=', $keepId)
                ->delete();
        }
    }

    private function mergeFieldingStats(): void
    {
        $groups = DB::table('player_fielding_stats')
            ->select('player_id', 'tournament_type')
            ->groupBy('player_id', 'tournament_type')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($groups as $group) {
            $rows = DB::table('player_fielding_stats')
                ->where('player_id', $group->player_id)
                ->where('tournament_type', $group->tournament_type)
                ->orderBy('id')
                ->get();

            $keepId = (int) $rows->first()->id;

            DB::table('player_fielding_stats')->where('id', $keepId)->update([
                'matches' => (int) $rows->sum('matches'),
                'catches' => (int) $rows->sum('catches'),
                'run_outs' => (int) $rows->sum('run_outs'),
                'stumpings' => (int) $rows->sum('stumpings'),
                'updated_at' => now(),
            ]);

            DB::table('player_fielding_stats')
                ->where('player_id', $group->player_id)
                ->where('tournament_type', $group->tournament_type)
                ->where('id', '!=', $keepId)
                ->delete();
        }
    }

    /**
     * @param  list<mixed>  $figures
     */
    private function pickBestFigure(array $figures): string
    {
        $parsed = [];
        foreach ($figures as $figure) {
            if (! is_string($figure) || $figure === '') {
                continue;
            }
            [$wickets, $runs] = array_pad(explode('/', $figure, 2), 2, '0');
            $parsed[] = ['wickets' => (int) $wickets, 'runs' => (int) $runs, 'raw' => $figure];
        }

        if ($parsed === []) {
            return '0/0';
        }

        usort($parsed, fn ($a, $b) => $b['wickets'] <=> $a['wickets'] ?: $a['runs'] <=> $b['runs']);

        return $parsed[0]['raw'];
    }
};
