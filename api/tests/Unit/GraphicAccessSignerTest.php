<?php

namespace Tests\Unit;

use App\Services\Graphics\GraphicAccessSigner;
use App\Settings\GraphicsSettings;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class GraphicAccessSignerTest extends TestCase
{
    public function test_sign_and_verify_round_trip(): void
    {
        $signer = new GraphicAccessSigner('unit-test-graphics-secret');
        $expires = time() + 3600;
        $signature = $signer->sign(42, $expires);

        $this->assertTrue($signer->verify(42, $expires, $signature));
        $this->assertFalse($signer->verify(99, $expires, $signature));
        $this->assertFalse($signer->verify(42, $expires, str_repeat('a', 64)));
    }

    public function test_rejects_expired_timestamp(): void
    {
        $signer = new GraphicAccessSigner('unit-test-graphics-secret');
        $expires = time() - 500;
        $signature = $signer->sign(1, $expires);

        $this->assertFalse($signer->verify(1, $expires, $signature));
    }

    public function test_build_parse_and_verify_token(): void
    {
        $signer = new GraphicAccessSigner('unit-test-graphics-secret');
        $expires = time() + 3600;
        $token = $signer->buildToken(7, $expires);

        $this->assertSame(
            sprintf('7-%d-%s', $expires, $signer->sign(7, $expires)),
            $token,
        );

        $parsed = $signer->parseToken($token);
        $this->assertNotNull($parsed);
        $this->assertSame(7, $parsed['sessionId']);
        $this->assertSame($expires, $parsed['expires']);

        $verified = $signer->verifyToken($token);
        $this->assertNotNull($verified);
        $this->assertSame(7, $verified['sessionId']);
    }

    public function test_rejects_malformed_token(): void
    {
        $signer = new GraphicAccessSigner('unit-test-graphics-secret');

        $this->assertNull($signer->parseToken(''));
        $this->assertNull($signer->parseToken('1-999-not-hex'));
        $this->assertNull($signer->verifyToken('1-999-'.str_repeat('a', 63)));
    }

    public function test_from_settings_throws_when_signing_secret_missing(): void
    {
        $settings = $this->createMock(GraphicsSettings::class);
        $settings->signingSecret = null;

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('GraphicsSettings::signingSecret is not configured.');

        GraphicAccessSigner::fromSettings($settings);
    }
}
