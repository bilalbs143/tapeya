<?php

namespace Tests\Unit\Support\Post;

use App\Models\User;
use App\Support\Post\PostMentionParser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PostMentionParserTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_extracts_unique_nicknames(): void
    {
        $nicknames = PostMentionParser::extractNicknames('Hey @Alice and @bob — also @Alice again');

        $this->assertSame(['Alice', 'bob'], $nicknames);
    }

    #[Test]
    public function it_extracts_quoted_multi_word_nicknames(): void
    {
        $nicknames = PostMentionParser::extractNicknames('Shoutout @"John Smith" and @coach');

        $this->assertSame(['John Smith', 'coach'], $nicknames);
    }

    #[Test]
    public function it_requires_quotes_for_multi_word_nicknames(): void
    {
        $this->assertSame(['John'], PostMentionParser::extractNicknames('Great innings @John Smith!'));
        $this->assertSame(['John Smith'], PostMentionParser::extractNicknames('Great innings @"John Smith"!'));
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

    #[Test]
    public function it_skips_ambiguous_nickname_matches(): void
    {
        User::factory()->create(['type' => 'user', 'nickname' => 'Ali Khan', 'status' => 'active']);
        User::factory()->create(['type' => 'user', 'nickname' => 'Ali Khan', 'status' => 'active']);

        $resolved = PostMentionParser::resolveUsers('Congrats @"Ali Khan"');

        $this->assertCount(0, $resolved);
    }

    #[Test]
    public function it_resolves_unique_nickname_matches(): void
    {
        $user = User::factory()->create(['type' => 'user', 'nickname' => 'Unique Nick', 'status' => 'active']);

        $resolved = PostMentionParser::resolveUsers('Hey @"Unique Nick"');

        $this->assertCount(1, $resolved);
        $this->assertSame($user->id, $resolved->first()->id);
    }
}
