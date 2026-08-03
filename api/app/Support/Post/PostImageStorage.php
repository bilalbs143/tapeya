<?php

namespace App\Support\Post;

use App\Support\Media\MediaDisk;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Encode an uploaded image as a single WebP and store it on the media disk.
 */
final class PostImageStorage
{
    /**
     * @return array{path: string, mime: string, width: int|null, height: int|null, size_bytes: int|null}
     */
    public static function storeFromUpload(
        UploadedFile $file,
        int|string $postKey,
        string $directory = 'posts/images',
    ): array {
        $uuid = (string) Str::uuid();
        $tmpOriginal = tempnam(sys_get_temp_dir(), 'postimg_');
        if ($tmpOriginal === false) {
            throw new \RuntimeException('Could not allocate temp file for image encode.');
        }

        try {
            $contents = file_get_contents($file->getRealPath() ?: $file->getPathname());
            if ($contents === false) {
                throw new \RuntimeException('Could not read uploaded image.');
            }
            file_put_contents($tmpOriginal, $contents);

            $encoded = self::encodeWebp($tmpOriginal);
            if ($encoded === null) {
                throw new \RuntimeException('Could not encode image as WebP.');
            }

            $directory = trim($directory, '/');
            if ($directory === '') {
                $directory = 'posts/images';
            }

            $path = $directory.'/'.$postKey.'/'.$uuid.'.webp';
            MediaDisk::put($path, $encoded['bytes'], [
                'ContentType' => 'image/webp',
            ]);

            return [
                'path' => $path,
                'mime' => 'image/webp',
                'width' => $encoded['width'],
                'height' => $encoded['height'],
                'size_bytes' => strlen($encoded['bytes']),
            ];
        } finally {
            @unlink($tmpOriginal);
        }
    }

    /**
     * @return array{bytes: string, width: int, height: int}|null
     */
    private static function encodeWebp(string $absolutePath): ?array
    {
        $image = self::loadGd($absolutePath);
        if ($image === null) {
            return null;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        if ($width < 1 || $height < 1) {
            imagedestroy($image);

            return null;
        }

        // Preserve alpha when re-encoding PNG/WebP sources.
        imagealphablending($image, true);
        imagesavealpha($image, true);

        // Re-encode in place at original dimensions (WebP only — no resize ladder).
        ob_start();
        $ok = imagewebp($image, null, 82);
        $bytes = (string) ob_get_clean();
        imagedestroy($image);

        if (! $ok || $bytes === '') {
            return null;
        }

        return [
            'bytes' => $bytes,
            'width' => $width,
            'height' => $height,
        ];
    }

    /**
     * @return \GdImage|resource|null
     */
    private static function loadGd(string $absolutePath)
    {
        $info = @getimagesize($absolutePath);
        $type = is_array($info) ? (int) ($info[2] ?? 0) : 0;

        return match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($absolutePath) ?: null,
            IMAGETYPE_PNG => @imagecreatefrompng($absolutePath) ?: null,
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? (@imagecreatefromwebp($absolutePath) ?: null) : null,
            IMAGETYPE_GIF => @imagecreatefromgif($absolutePath) ?: null,
            default => null,
        };
    }
}
