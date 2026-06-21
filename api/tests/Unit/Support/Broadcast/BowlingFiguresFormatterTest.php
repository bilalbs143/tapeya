<?php

namespace Tests\Unit\Support\Broadcast;

use App\Support\Broadcast\BowlingFiguresFormatter;
use PHPUnit\Framework\TestCase;

class BowlingFiguresFormatterTest extends TestCase
{
    public function test_formats_wickets_and_runs_with_hyphen(): void
    {
        $this->assertSame('2-28', BowlingFiguresFormatter::format(2, 28));
        $this->assertSame('0-0', BowlingFiguresFormatter::format(0, 0));
    }
}
