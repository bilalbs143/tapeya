<?php

namespace Tests\Unit\Support\Media;

use App\Support\Media\MediaDisk;
use App\Support\Media\MediaWriteException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaDiskTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake(MediaDisk::name());
    }

    public function test_store_uploaded_writes_without_visibility_and_returns_path(): void
    {
        $file = UploadedFile::fake()->image('photo.jpg', 40, 40);

        $path = MediaDisk::storeUploaded($file, 'posts/images/test');

        $this->assertIsString($path);
        $this->assertNotSame('0', $path);
        $this->assertNotSame('', $path);
        Storage::disk(MediaDisk::name())->assertExists($path);
    }

    public function test_put_strips_visibility_acl_options(): void
    {
        $key = 'posts/images/probe/'.uniqid('', true).'.txt';

        $stored = MediaDisk::put($key, 'hello', [
            'visibility' => 'public',
            'ACL' => 'public-read',
            'ContentType' => 'text/plain',
        ]);

        $this->assertSame($key, $stored);
        Storage::disk(MediaDisk::name())->assertExists($key);
    }

    public function test_write_options_default_immutable_cache_control(): void
    {
        $options = MediaDisk::writeOptions([
            'visibility' => 'public',
            'ACL' => 'public-read',
            'ContentType' => 'video/mp4',
        ]);

        $this->assertSame(MediaDisk::IMMUTABLE_CACHE_CONTROL, $options['CacheControl']);
        $this->assertSame('video/mp4', $options['ContentType']);
        $this->assertArrayNotHasKey('visibility', $options);
        $this->assertArrayNotHasKey('ACL', $options);
    }

    public function test_write_options_preserves_caller_cache_control(): void
    {
        $options = MediaDisk::writeOptions([
            'CacheControl' => 'private, max-age=60',
        ]);

        $this->assertSame('private, max-age=60', $options['CacheControl']);
    }

    public function test_require_path_rejects_falsey_paths(): void
    {
        $this->expectException(MediaWriteException::class);
        MediaDisk::requirePath(false);
    }

    public function test_require_path_rejects_zero_string(): void
    {
        $this->expectException(MediaWriteException::class);
        MediaDisk::requirePath('0');
    }

    public function test_url_returns_null_for_corrupt_paths(): void
    {
        $this->assertNull(MediaDisk::url(null));
        $this->assertNull(MediaDisk::url(''));
        $this->assertNull(MediaDisk::url('0'));
    }

    public function test_configure_filesystem_removes_s3_visibility(): void
    {
        config(['filesystems.disks.s3.visibility' => 'public']);

        MediaDisk::configureFilesystem();

        $this->assertArrayNotHasKey('visibility', config('filesystems.disks.s3'));
        $this->assertTrue(config('filesystems.disks.s3.throw'));
        $this->assertTrue(config('filesystems.disks.s3.report'));
    }
}
