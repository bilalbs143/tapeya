<?php

namespace App\Support\Media;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Single write path for {@see config('filesystems.media_disk')}.
 *
 * Production S3/B2 buckets use BucketOwnerEnforced (no object ACLs). Public read is
 * via CDN / bucket policy — never {@see UploadedFile::storePublicly()} or visibility=public.
 * {@see MediaCdn} sets the public URL base on the s3 disk.
 */
final class MediaDisk
{
    public const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

    public static function name(): string
    {
        return (string) config('filesystems.media_disk', 'public');
    }

    public static function disk(): Filesystem
    {
        return Storage::disk(self::name());
    }

    /**
     * Harden s3 disk config at boot: no ACL visibility, throw on write failure.
     */
    public static function configureFilesystem(): void
    {
        $s3 = config('filesystems.disks.s3', []);
        if (! is_array($s3)) {
            return;
        }

        // Flysystem maps visibility → canned ACL; BucketOwnerEnforced rejects those.
        unset($s3['visibility']);

        $s3['throw'] = true;
        $s3['report'] = true;

        config(['filesystems.disks.s3' => $s3]);
    }

    /**
     * Merge write options: strip ACLs, default immutable Cache-Control.
     * Caller CacheControl / ContentType win when set.
     *
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public static function writeOptions(array $options = []): array
    {
        unset($options['visibility'], $options['ACL'], $options['Acl'], $options['acl']);

        $hasCacheControl = array_key_exists('CacheControl', $options)
            || array_key_exists('cache_control', $options)
            || array_key_exists('Cache-Control', $options);

        if (! $hasCacheControl) {
            $options['CacheControl'] = self::IMMUTABLE_CACHE_CONTROL;
        }

        return $options;
    }

    /**
     * Store an uploaded file without object ACLs.
     *
     * @throws MediaWriteException
     */
    public static function storeUploaded(UploadedFile $file, string $directory, ?string $filename = null): string
    {
        $directory = trim($directory, '/');
        $options = self::writeOptions([
            'ContentType' => $file->getMimeType() ?: 'application/octet-stream',
        ]);

        try {
            $path = $filename !== null && $filename !== ''
                ? self::disk()->putFileAs($directory, $file, $filename, $options)
                : self::disk()->putFile($directory, $file, $options);
        } catch (Throwable $e) {
            throw new MediaWriteException('Media upload failed.', 0, $e);
        }

        return self::requirePath($path);
    }

    /**
     * Put raw contents without object ACLs.
     *
     * @param  mixed  $contents  string|resource
     * @param  array<string, mixed>  $options  ContentType etc. — visibility/ACL keys are stripped
     *
     * @throws MediaWriteException
     */
    public static function put(string $key, mixed $contents, array $options = []): string
    {
        $options = self::writeOptions($options);

        try {
            $ok = self::disk()->put($key, $contents, $options);
        } catch (Throwable $e) {
            throw new MediaWriteException('Media upload failed.', 0, $e);
        }

        if ($ok === false) {
            throw new MediaWriteException('Media upload failed.');
        }

        return $key;
    }

    /**
     * @throws MediaWriteException
     */
    public static function requirePath(mixed $path): string
    {
        if (! is_string($path) || $path === '' || $path === '0') {
            throw new MediaWriteException('Media upload failed: storage returned an invalid path.');
        }

        return $path;
    }

    /**
     * Public URL for a stored key, or null for missing / corrupt paths.
     */
    public static function url(?string $path): ?string
    {
        if ($path === null || $path === '' || $path === '0') {
            return null;
        }

        return self::disk()->url($path);
    }

    public static function delete(?string $path): void
    {
        if ($path === null || $path === '' || $path === '0') {
            return;
        }

        self::disk()->delete($path);
    }

    public static function deleteDirectory(string $directory): void
    {
        $directory = trim($directory, '/');
        if ($directory === '' || $directory === '0') {
            return;
        }

        self::disk()->deleteDirectory($directory);
    }

    public static function exists(?string $path): bool
    {
        if ($path === null || $path === '' || $path === '0') {
            return false;
        }

        return self::disk()->exists($path);
    }
}
