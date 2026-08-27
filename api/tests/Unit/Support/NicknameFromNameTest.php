<?php

namespace Tests\Unit\Support;

use App\Models\User;
use App\Support\NicknameFromName;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NicknameFromNameTest extends TestCase
{
    use RefreshDatabase;

    public function test_slugs_full_name(): void
    {
        $this->assertSame('muhammad_ali', NicknameFromName::slug('Muhammad Ali'));
        $this->assertSame('player', NicknameFromName::slug('   '));
    }

    public function test_unique_appends_numeric_suffix(): void
    {
        User::factory()->create(['type' => 'user', 'nickname' => 'ali_khan']);

        $this->assertSame('ali_khan_2', NicknameFromName::unique('Ali Khan'));
    }

    public function test_create_user_retries_when_nickname_taken(): void
    {
        User::factory()->create(['type' => 'user', 'nickname' => 'ali_khan']);

        $created = NicknameFromName::createUser([
            'name' => 'Ali Khan',
            'phone' => '+923008887777',
            'type' => 'user',
            'status' => 'verification_pending',
        ], 'Ali Khan');

        $this->assertSame('ali_khan_2', $created->nickname);
    }
}
