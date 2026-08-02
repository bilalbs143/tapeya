<?php

namespace Tests\Unit\Support\Reel;

use App\Support\Post\PostMentionParser;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PostMentionParserTest extends TestCase
{
    #[Test]
    public function it_extracts_unique_nicknames(): void
    {
        $nicknames = PostMentionParser::extractNicknames('Hey @Alice and @bob — also @Alice again');

        $this->assertSame(['Alice', 'bob'], $nicknames);
    }

    #[Test]
    public function it_ignores_email_like_at_tokens(): void
    {
        $this->assertSame([], PostMentionParser::extractNicknames('mail me at user@gmail.com please'));
        $this->assertSame(['coach'], PostMentionParser::extractNicknames('ask @coach or user@gmail.com'));
    }

    #[Test]
    public function it_supports_mention_at_start_of_body(): void
    {
        $this->assertSame(['ali'], PostMentionParser::extractNicknames('@ali nice shot'));
    }

    #[Test]
    public function it_returns_empty_when_no_mentions(): void
    {
        $this->assertSame([], PostMentionParser::extractNicknames('No mentions here'));
        $this->assertSame([], PostMentionParser::extractNicknames(''));
    }
}
