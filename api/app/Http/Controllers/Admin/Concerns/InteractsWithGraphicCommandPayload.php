<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\MatchGraphicCommand;
use App\Services\Broadcast\GraphicCareerEnricher;

/**
 * Shared helpers for creating and mutating {@see MatchGraphicCommand} records.
 *
 * @property GraphicCareerEnricher $careerPayloadEnricher
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
    protected function prepareCommandPayload(array $data, ?GraphicCommandKeyEnum $key): array
    {
        $hadPayloadKey = array_key_exists('payload', $data);
        $originalPayload = $hadPayloadKey ? $data['payload'] : null;
        $payload = is_array($originalPayload) ? $originalPayload : [];

        if ($key !== null) {
            $payload = $this->careerPayloadEnricher->enrichForCommandKey($payload, $key);
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
        $enriched = $this->careerPayloadEnricher->enrichForCommandKey($payload, $key);

        if ($enriched === $payload) {
            return;
        }

        $command->update(['payload' => $enriched]);
        $command->refresh();
    }
}
