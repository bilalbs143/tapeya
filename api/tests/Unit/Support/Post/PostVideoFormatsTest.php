<?php

namespace Tests\Unit\Support\Reel;

use App\Support\Post\PostVideoFormats;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PostVideoFormatsTest extends TestCase
{
    public function test_file_rules_use_mobile_extensions(): void
    {
        $rules = PostVideoFormats::fileRules();

        $this->assertContains('required', $rules);
        $this->assertContains('file', $rules);
        $this->assertTrue(
            collect($rules)->contains(fn ($rule) => is_string($rule) && str_starts_with($rule, 'mimes:')),
        );
        $this->assertStringContainsString('mp4', implode(',', $rules));
        $this->assertStringContainsString('mov', implode(',', $rules));
        $this->assertStringContainsString('3gp', implode(',', $rules));
    }

    #[DataProvider('extensionProvider')]
    public function test_allowed_extensions(string $ext, bool $allowed): void
    {
        $this->assertSame($allowed, PostVideoFormats::isAllowedExtension($ext));
    }

    public static function extensionProvider(): array
    {
        return [
            ['mp4', true],
            ['MOV', true],
            ['m4v', true],
            ['webm', true],
            ['3gp', true],
            ['3gpp', true],
            ['avi', false],
            ['mkv', false],
            ['', false],
        ];
    }

    public function test_sniffs_mp4_ftyp(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'reel');
        // size(4) + ftyp + isom
        file_put_contents($path, "\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2");

        try {
            $this->assertSame('mp4', PostVideoFormats::sniffExtension($path));
            PostVideoFormats::assertLooksLikeVideo($path);
        } finally {
            @unlink($path);
        }
    }

    public function test_sniffs_mov_qt_brand(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'reel');
        file_put_contents($path, "\x00\x00\x00\x14ftypqt  \x00\x00\x00\x00");

        try {
            $this->assertSame('mov', PostVideoFormats::sniffExtension($path));
            $this->assertSame('mov', PostVideoFormats::resolveExtension($path, 'IMG_0001.MOV', 'video/quicktime'));
            $this->assertSame('video/quicktime', PostVideoFormats::contentTypeForExtension('mov'));
        } finally {
            @unlink($path);
        }
    }

    public function test_sniffs_3gp_brand(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'reel');
        file_put_contents($path, "\x00\x00\x00\x14ftyp3gp4\x00\x00\x00\x00");

        try {
            $this->assertSame('3gp', PostVideoFormats::sniffExtension($path));
        } finally {
            @unlink($path);
        }
    }

    public function test_sniffs_webm_ebml(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'reel');
        file_put_contents($path, "\x1A\x45\xDF\xA3".str_repeat("\x00", 20));

        try {
            $this->assertSame('webm', PostVideoFormats::sniffExtension($path));
        } finally {
            @unlink($path);
        }
    }

    public function test_rejects_non_video_bytes(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'reel');
        file_put_contents($path, 'not-a-video-file-content');

        try {
            $this->expectException(ValidationException::class);
            PostVideoFormats::assertLooksLikeVideo($path);
        } finally {
            @unlink($path);
        }
    }

    public function test_client_filename_wins_when_allowed(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'reel');
        file_put_contents($path, "\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2");

        try {
            $this->assertSame(
                'mov',
                PostVideoFormats::resolveExtension($path, 'clip.mov', 'video/mp4'),
            );
        } finally {
            @unlink($path);
        }
    }
}
