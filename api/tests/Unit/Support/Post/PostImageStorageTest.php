<?php

namespace Tests\Unit\Support\Post;

use App\Support\Media\MediaDisk;
use App\Support\Post\PostImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostImageStorageTest extends TestCase
{
    public function test_store_from_upload_writes_single_webp_at_original_dimensions(): void
    {
        Storage::fake(MediaDisk::name());

        $file = UploadedFile::fake()->image('match.jpg', 1600, 1200);
        $stored = PostImageStorage::storeFromUpload($file, 'compose-test');

        $this->assertStringEndsWith('.webp', $stored['path']);
        $this->assertSame('image/webp', $stored['mime']);
        $this->assertSame(1600, $stored['width']);
        $this->assertSame(1200, $stored['height']);
        $this->assertGreaterThan(0, $stored['size_bytes']);

        Storage::disk(MediaDisk::name())->assertExists($stored['path']);
    }
}
