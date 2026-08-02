<?php

namespace Tests\Unit\Enums\Post;

use App\Enums\Post\PostBackgroundId;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PostBackgroundIdTest extends TestCase
{
    public function test_input_values_include_plain_and_persisted_cases(): void
    {
        $values = PostBackgroundId::inputValues();

        $this->assertContains('plain', $values);
        $this->assertContains('bats', $values);
        $this->assertContains('wickets', $values);
        $this->assertContains('century', $values);
        $this->assertSame(PostBackgroundId::values(), array_values(array_filter(
            $values,
            fn (string $v) => $v !== 'plain'
        )));
    }

    #[DataProvider('normalizeProvider')]
    public function test_normalize(?string $input, ?string $expected): void
    {
        $this->assertSame($expected, PostBackgroundId::normalize($input));
    }

    /**
     * @return array<string, array{0: mixed, 1: ?string}>
     */
    public static function normalizeProvider(): array
    {
        return [
            'null' => [null, null],
            'empty' => ['', null],
            'plain' => ['plain', null],
            'bats' => ['bats', 'bats'],
            'century' => ['century', 'century'],
            'unknown' => ['nope', null],
        ];
    }
}
