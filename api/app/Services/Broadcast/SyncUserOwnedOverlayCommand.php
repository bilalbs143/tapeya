<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;

/**
 * User-owned overlay lifecycle:
 * before toss → THIS_MATCH; after toss → TOSS_LT; after first ball → LT_DEFAULT.
 *
 * Scoring flashes still layer on top of LT_DEFAULT (they do not change active_command).
 */
final class SyncUserOwnedOverlayCommand
{
    /** @var list<string> */
    private const LIFECYCLE_KEYS = [
        GraphicCommandKeyEnum::THIS_MATCH->value,
        GraphicCommandKeyEnum::TOSS_LT->value,
        GraphicCommandKeyEnum::LT_DEFAULT->value,
    ];

    /**
     * @return bool True when a new command was written and activated.
     */
    public function ensure(MatchGraphicSession $session, TournamentMatch $match, ?int $userId, bool $force = true): bool
    {
        $desired = $this->desiredKey($match);
        $session->loadMissing('activeCommand');
        $current = $this->activeKey($session);

        if ($current === $desired->value) {
            return false;
        }

        if (! $force && $current !== '' && ! in_array($current, self::LIFECYCLE_KEYS, true)) {
            return false;
        }

        DB::transaction(function () use ($session, $desired, $userId): void {
            $command = MatchGraphicCommand::query()->create([
                'match_graphic_session_id' => $session->id,
                'command_type' => $desired->commandType()->value,
                'command_key' => $desired->value,
                'payload' => null,
                'display_mode' => $desired->displayMode()->value,
                'created_by' => $userId,
            ]);

            $session->update([
                'active_command_id' => $command->id,
                'updated_by' => $userId,
            ]);
        });

        $session->unsetRelation('activeCommand');

        return true;
    }

    /**
     * Advance lifecycle when a session already exists (toss / first ball).
     * Does not overwrite Match Controller commands outside the lifecycle set.
     *
     * @return bool True when the active command changed.
     */
    public function advanceIfPresent(TournamentMatch $match, ?int $userId): bool
    {
        $session = FindMatchGraphicSession::forMatch($match);
        if ($session === null) {
            return false;
        }

        return $this->ensure($session, $match, $userId, force: false);
    }

    public function desiredKey(TournamentMatch $match): GraphicCommandKeyEnum
    {
        if ($this->hasAnyBall($match)) {
            return GraphicCommandKeyEnum::LT_DEFAULT;
        }

        if ($this->tossIsDone($match)) {
            return GraphicCommandKeyEnum::TOSS_LT;
        }

        return GraphicCommandKeyEnum::THIS_MATCH;
    }

    private function tossIsDone(TournamentMatch $match): bool
    {
        if ($match->toss_winner_team_id !== null) {
            return true;
        }

        $status = $match->status;
        if ($status instanceof MatchStatusEnum) {
            return in_array($status, [
                MatchStatusEnum::TOSS_DONE,
                MatchStatusEnum::IN_PROGRESS,
                MatchStatusEnum::COMPLETED,
            ], true);
        }

        return in_array((string) $status, [
            MatchStatusEnum::TOSS_DONE->value,
            MatchStatusEnum::IN_PROGRESS->value,
            MatchStatusEnum::COMPLETED->value,
        ], true);
    }

    private function hasAnyBall(TournamentMatch $match): bool
    {
        $inningsIds = Innings::query()
            ->where('match_id', $match->id)
            ->pluck('id');

        if ($inningsIds->isEmpty()) {
            return false;
        }

        return Ball::query()->whereIn('innings_id', $inningsIds)->exists();
    }

    private function activeKey(MatchGraphicSession $session): string
    {
        $raw = $session->activeCommand?->command_key;
        if ($raw instanceof \BackedEnum) {
            return (string) $raw->value;
        }

        return (string) ($raw ?? '');
    }
}
