<?php

namespace App\Support\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;

/**
 * Builds the graphics command manifest from {@see GraphicCommandKeyEnum}.
 *
 * The manifest is the shared contract distributed to overlay, backoffice, and CI.
 */
final class GraphicCommandManifestBuilder
{
    /**
     * @return array{
     *     version: int,
     *     commands: list<array{
     *         key: string,
     *         type: string,
     *         label: string,
     *         displayMode: string|null,
     *         category: string,
     *         requires: array<string, mixed>,
     *         status: string,
     *         processorId: string
     *     }>
     * }
     */
    public static function build(): array
    {
        $commands = [];

        foreach (GraphicCommandKeyEnum::cases() as $key) {
            $commands[] = self::definitionFor($key);
        }

        return [
            'version' => 1,
            'commands' => $commands,
        ];
    }

    /**
     * @return array{
     *     key: string,
     *     type: string,
     *     label: string,
     *     displayMode: string|null,
     *     category: string,
     *     requires: array<string, mixed>,
     *     status: string,
     *     processorId: string
     * }
     */
    public static function definitionFor(GraphicCommandKeyEnum $key): array
    {
        $category = self::categoryFor($key);

        return [
            'key' => $key->value,
            'type' => $key->commandType()->value,
            'label' => $key->label(),
            'displayMode' => $category === 'animation' ? null : $key->displayMode()->value,
            'category' => $category,
            'requires' => self::requiresFor($key),
            'status' => self::statusFor($key),
            'processorId' => $key->value,
        ];
    }

    private static function categoryFor(GraphicCommandKeyEnum $key): string
    {
        return match ($key) {
            GraphicCommandKeyEnum::LT_EMPTY => 'clear',
            GraphicCommandKeyEnum::ADD_CAPTION => 'backoffice_only',

            GraphicCommandKeyEnum::FST_FOUR,
            GraphicCommandKeyEnum::FST_SIX,
            GraphicCommandKeyEnum::FST_NOT_OUT,
            GraphicCommandKeyEnum::FST_OUT,
            GraphicCommandKeyEnum::FST_NO_BALL,
            GraphicCommandKeyEnum::FST_WIDE,
            GraphicCommandKeyEnum::FST_FIFTY,
            GraphicCommandKeyEnum::FST_HUNDRED,
            GraphicCommandKeyEnum::FST_REPLAY,
            GraphicCommandKeyEnum::FST_DECISION,
            GraphicCommandKeyEnum::LT_FOUR,
            GraphicCommandKeyEnum::LT_SIX,
            GraphicCommandKeyEnum::LT_WIDE,
            GraphicCommandKeyEnum::LT_NO_BALL,
            GraphicCommandKeyEnum::LT_NOT_OUT,
            GraphicCommandKeyEnum::LT_OUT,
            GraphicCommandKeyEnum::FIFTY_UP,
            GraphicCommandKeyEnum::HUNDRED_UP,
            GraphicCommandKeyEnum::LT_REPLAY,
            GraphicCommandKeyEnum::DECISION_PENDING => 'animation',

            default => 'data',
        };
    }

    private static function statusFor(GraphicCommandKeyEnum $key): string
    {
        return 'active';
    }

    /**
     * Generate the JS constants file content.
     *
     * Writes:
     *  - GRAPHIC_KEYS   — all command key strings as a const object
     *  - NULL_COMPONENT_KEYS — keys that render nothing on the overlay
     *  - ANIMATION_KEYS — keys registered via the manifest loop (not static PROCESSOR_MAP)
     *  - BACKOFFICE_ONLY_KEYS — keys that never reach the overlay
     */
    public static function buildJsConstants(): string
    {
        $cases = GraphicCommandKeyEnum::cases();

        $allKeys = [];
        $nullKeys = [];
        $animationKeys = [];
        $backofficeKeys = [];

        foreach ($cases as $key) {
            $allKeys[] = $key->value;
            $cat = self::categoryFor($key);
            if ($cat === 'clear' || $cat === 'backoffice_only') {
                $nullKeys[] = $key->value;
            }
            if ($cat === 'animation') {
                $animationKeys[] = $key->value;
            }
            if ($cat === 'backoffice_only') {
                $backofficeKeys[] = $key->value;
            }
        }

        $keyLines = implode("\n", array_map(
            fn (string $k) => "  {$k}: '{$k}',",
            $allKeys,
        ));

        $toJsSet = static fn (array $keys): string => 'new Set(['.implode(', ', array_map(fn ($k) => "'{$k}'", $keys)).'])';

        return <<<JS
        // AUTO-GENERATED — do not edit manually.
        // Source of truth: api/app/Enums/Broadcast/GraphicCommandKeyEnum.php
        // Regenerate  : cd api && php artisan graphics:export-manifest

        /** All graphic command key strings, mirroring GraphicCommandKeyEnum.php. */
        export const GRAPHIC_KEYS = /** @type {const} */ ({
        {$keyLines}
        });

        /** @typedef {typeof GRAPHIC_KEYS[keyof typeof GRAPHIC_KEYS]} GraphicCommandKey */

        /** Keys that render nothing on the overlay (transparent/no component). */
        export const NULL_COMPONENT_KEYS = {$toJsSet($nullKeys)};

        /** Keys registered via the manifest animation loop in processorMap.js, not the static block. */
        export const ANIMATION_KEYS = {$toJsSet($animationKeys)};

        /** Keys that are backoffice-only and never dispatched to the overlay. */
        export const BACKOFFICE_ONLY_KEYS = {$toJsSet($backofficeKeys)};
        JS;
    }

    /**
     * @return array<string, mixed>
     */
    private static function requiresFor(GraphicCommandKeyEnum $key): array
    {
        return match ($key) {
            GraphicCommandKeyEnum::CUSTOM,
            GraphicCommandKeyEnum::ADD_CAPTION => ['caption' => true],

            GraphicCommandKeyEnum::PLAYING_11 => ['playing_eleven_payload' => true],

            GraphicCommandKeyEnum::BATSMAN_NAME_LT,
            GraphicCommandKeyEnum::BATSMAN_NAME_FS,
            GraphicCommandKeyEnum::BATSMAN_MATCH_LT,
            GraphicCommandKeyEnum::BATSMAN_MATCH_FS,
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_FS,
            GraphicCommandKeyEnum::BATSMAN_WAGON_WHEEL => ['player_pick' => 'batsman'],

            GraphicCommandKeyEnum::BOWLER_NAME_LT,
            GraphicCommandKeyEnum::BOWLER_NAME_FS,
            GraphicCommandKeyEnum::BOWLER_MATCH_LT,
            GraphicCommandKeyEnum::BOWLER_MATCH_FS,
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_FS => ['player_pick' => 'bowler'],

            GraphicCommandKeyEnum::MOM => ['player_of_match' => true],

            default => [],
        };
    }
}
