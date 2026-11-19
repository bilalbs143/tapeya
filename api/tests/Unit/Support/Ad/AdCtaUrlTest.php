<?php

namespace Tests\Unit\Support\Ad;

use App\Support\Ad\AdCtaUrl;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdCtaUrlTest extends TestCase
{
    #[DataProvider('whatsappProvider')]
    public function test_whatsapp_digits(string $input, ?string $expected): void
    {
        $this->assertSame($expected, AdCtaUrl::whatsappDigits($input));
    }

    /**
     * @return array<string, array{0: string, 1: string|null}>
     */
    public static function whatsappProvider(): array
    {
        return [
            'digits' => ['923001234567', '923001234567'],
            'formatted' => ['+92 300-1234567', '923001234567'],
            'wa.me' => ['https://wa.me/923001234567', '923001234567'],
            'api' => ['https://api.whatsapp.com/send?phone=923001234567', '923001234567'],
            'short' => ['123', null],
        ];
    }

    public function test_type_validation(): void
    {
        $this->assertTrue(AdCtaUrl::isValid('url', 'https://example.com'));
        $this->assertFalse(AdCtaUrl::isValid('url', 'not-a-url'));
        $this->assertTrue(AdCtaUrl::isValid('whatsapp', '+92 300 1234567'));
        $this->assertFalse(AdCtaUrl::isValid('whatsapp', 'abc'));
        $this->assertTrue(AdCtaUrl::isValid('deep_link', '/shop'));
    }
}
