<?php

namespace Tests\Unit\Enums\Post;

use App\Enums\Post\PostVisibilityEnum;
use PHPUnit\Framework\TestCase;

class PostVisibilityEnumTest extends TestCase
{
    public function test_cap_to_returns_more_restrictive(): void
    {
        $this->assertSame(PostVisibilityEnum::Followers, PostVisibilityEnum::Public->capTo(PostVisibilityEnum::Followers));
        $this->assertSame(PostVisibilityEnum::Private, PostVisibilityEnum::Public->capTo(PostVisibilityEnum::Private));
        $this->assertSame(PostVisibilityEnum::Followers, PostVisibilityEnum::Followers->capTo(PostVisibilityEnum::Public));
        $this->assertSame(PostVisibilityEnum::Private, PostVisibilityEnum::Private->capTo(PostVisibilityEnum::Public));
    }
}
