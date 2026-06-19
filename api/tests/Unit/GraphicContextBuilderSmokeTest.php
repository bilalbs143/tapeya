<?php

namespace Tests\Unit;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Support\Broadcast\GraphicCommandManifestBuilder;
use PHPUnit\Framework\TestCase;

/**
 * Smoke checks that newly wired command keys are registered in the manifest contract.
 */
class GraphicContextBuilderSmokeTest extends TestCase
{
    public function test_tour_wickets_manifest_entry_is_active_lt_tour_hits(): void
    {
        $def = GraphicCommandManifestBuilder::definitionFor(GraphicCommandKeyEnum::TOUR_WICKETS);

        $this->assertSame('TOUR_WICKETS', $def['key']);
        $this->assertSame('TOUR_HITS', $def['type']);
        $this->assertSame('LT', $def['displayMode']);
        $this->assertSame('active', $def['status']);
        $this->assertSame('TOUR_WICKETS', $def['processorId']);
    }

    public function test_all_tour_hit_commands_use_lt_display_mode(): void
    {
        $tourKeys = [
            GraphicCommandKeyEnum::TOUR_FOURS,
            GraphicCommandKeyEnum::TOUR_SIXES,
            GraphicCommandKeyEnum::TOUR_FIFTIES,
            GraphicCommandKeyEnum::TOUR_HUNDREDS,
            GraphicCommandKeyEnum::TOUR_RUNS,
            GraphicCommandKeyEnum::TOUR_WICKETS,
        ];

        foreach ($tourKeys as $key) {
            $this->assertSame('LT', $key->displayMode()->value, "Expected {$key->value} to render as LT");
        }
    }
}
