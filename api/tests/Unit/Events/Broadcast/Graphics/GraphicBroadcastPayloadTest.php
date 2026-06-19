<?php

namespace Tests\Unit\Events\Broadcast\Graphics;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Events\Broadcast\Graphics\MatchGraphicFlashDispatched;
use App\Support\Broadcast\GraphicBroadcastEnvelope;
use PHPUnit\Framework\TestCase;

class GraphicBroadcastPayloadTest extends TestCase
{
    public function test_flash_broadcast_omits_context_and_stays_under_pusher_limit(): void
    {
        $event = new MatchGraphicFlashDispatched(
            matchId: 6,
            ballId: 99,
            commands: [GraphicCommandKeyEnum::LT_SIX],
            contextHash: 'abc123',
        );

        $payload = $event->broadcastWith();

        $this->assertArrayNotHasKey('context', $payload);
        $this->assertSame('abc123', $payload['context_hash']);
        $this->assertSame(['LT_SIX'], $payload['commands']);

        $bytes = strlen(json_encode($payload, JSON_THROW_ON_ERROR));
        $this->assertLessThan(GraphicBroadcastEnvelope::MAX_PAYLOAD_BYTES, $bytes);
    }
}
