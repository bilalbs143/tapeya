<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\MatchGraphicCommand;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicCareerEnricher;
use App\Services\Broadcast\GraphicPlayerProfileEnricher;

/**
 * Shared helpers for creating and mutating {@see MatchGraphicCommand} records.
 *
 * @property GraphicCareerEnricher $careerPayloadEnricher
 * @property GraphicPlayerProfileEnricher $playerProfileEnricher
 */
trait InteractsWithGraphicCommandPayload
{
    protected function scalarEnumOrString(mixed $value): string
    {
        return $value instanceof \BackedEnum ? $value->value : (string) $value;
    }

    protected function resolveCommandKey(mixed $raw): ?GraphicCommandKeyEnum
    {
        if ($raw instanceof GraphicCommandKeyEnum) {
            return $raw;
        }

        return GraphicCommandKeyEnum::tryFrom((string) ($raw ?? ''));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: bool, 2: mixed}
     */
    protected function prepareCommandPayload(array $data, ?GraphicCommandKeyEnum $key, ?TournamentMatch $match = null): array
    {
        $hadPayloadKey = array_key_exists('payload', $data);
        $originalPayload = $hadPayloadKey ? $data['payload'] : null;
        $payload = is_array($originalPayload) ? $originalPayload : [];

        $payload = $this->injectMomUserId($payload, $key, $match);

        if ($key !== null) {
            $payload = $this->playerProfileEnricher->enrichForCommandKey($payload, $key, $match);
            $payload = $this->careerPayloadEnricher->enrichForCommandKey($payload, $key, $match);
        }

        return [$payload, $hadPayloadKey, $originalPayload];
    }

    /**
     * @param  array<string, mixed>|null  $original
     * @param  array<string, mixed>  $work
     */
    protected function persistedPayload(bool $hadPayloadKey, mixed $original, array $work): ?array
    {
        if ($work !== []) {
            return $work;
        }
        if ($hadPayloadKey && is_array($original)) {
            return [];
        }

        return null;
    }

    protected function enrichStoredCommandPayloadIfNeeded(MatchGraphicCommand $command): void
    {
        $key = $this->resolveCommandKey($command->command_key);
        if ($key === null) {
            return;
        }

        $original = $command->payload;
        $payload = is_array($original) ? $original : [];
        $match = $command->session?->match;
        if ($match instanceof TournamentMatch) {
            $payload = $this->injectMomUserId($payload, $key, $match);
            $payload = $this->playerProfileEnricher->enrichForCommandKey($payload, $key, $match);
        }
        $enriched = $this->careerPayloadEnricher->enrichForCommandKey($payload, $key, $match instanceof TournamentMatch ? $match : null);

        if ($enriched === $payload) {
            return;
        }

        $command->update(['payload' => $enriched]);
        $command->refresh();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function injectMomUserId(array $payload, ?GraphicCommandKeyEnum $key, ?TournamentMatch $match): array
    {
        if ($key !== GraphicCommandKeyEnum::MOM || ! $match?->player_of_match_user_id) {
            return $payload;
        }

        $payload['user_id'] ??= (int) $match->player_of_match_user_id;

        return $payload;
    }
}
