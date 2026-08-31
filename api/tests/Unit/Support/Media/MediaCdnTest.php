<?php

namespace Tests\Unit\Support\Media;

use App\Support\Media\MediaCdn;
use Tests\TestCase;

class MediaCdnTest extends TestCase
{
    public function test_normalize_trims_slash_and_adds_https(): void
    {
        $this->assertSame('https://cdn.tapeya.com', MediaCdn::normalizeBaseUrl('https://cdn.tapeya.com/'));
        $this->assertSame('https://cdn.tapeya.com', MediaCdn::normalizeBaseUrl('cdn.tapeya.com'));
        $this->assertNull(MediaCdn::normalizeBaseUrl(''));
        $this->assertNull(MediaCdn::normalizeBaseUrl('   '));
        $this->assertNull(MediaCdn::normalizeBaseUrl(null));
    }

    public function test_apply_ignores_aws_url_and_defaults_when_setting_empty(): void
    {
        config(['filesystems.disks.s3.url' => 'https://cdn.from-env.example']);

        MediaCdn::applyToFilesystemConfig();

        $this->assertSame(MediaCdn::DEFAULT_PUBLIC_BASE, config('filesystems.disks.s3.url'));
    }
}
