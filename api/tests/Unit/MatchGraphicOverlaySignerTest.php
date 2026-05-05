<?php

namespace Tests\Unit;

use App\Services\Overlay\MatchGraphicOverlaySigner;
use PHPUnit\Framework\TestCase;

class MatchGraphicOverlaySignerTest extends TestCase
{
    public function test_sign_and_verify_round_trip(): void
    {
        $signer = new MatchGraphicOverlaySigner('unit-test-overlay-secret');
        $expires = time() + 3600;
        $signature = $signer->sign(42, $expires);

        $this->assertTrue($signer->verify(42, $expires, $signature));
        $this->assertFalse($signer->verify(99, $expires, $signature));
        $this->assertFalse($signer->verify(42, $expires, str_repeat('a', 64)));
    }

    public function test_rejects_expired_timestamp(): void
    {
        $signer = new MatchGraphicOverlaySigner('unit-test-overlay-secret');
        $expires = time() - 500;
        $signature = $signer->sign(1, $expires);

        $this->assertFalse($signer->verify(1, $expires, $signature));
    }
}
