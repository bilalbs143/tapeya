<?php

namespace App\Support\Post;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

/**
 * Mobile-first reel originals: Android Camera (MP4/3GP) + iOS Camera Roll (MOV/M4V/MP4).
 * Playback always goes through FFmpeg → HLS; originals may be any of these containers.
 */
final class PostVideoFormats
{
    /** @var list<string> */
    public const EXTENSIONS = ['mp4', 'mov', 'm4v', 'webm', '3gp', '3gpp'];

    /** @var list<string> */
    public const MIMES = [
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'video/x-m4v',
        'video/3gpp',
        'video/3gpp2',
        'video/hevc',
        'video/h265',
        'application/octet-stream',
    ];

    /**
     * Laravel rules for a single original upload (MediaRegistry / UserMediaController).
     * Extension-based `mimes` is more reliable than strict `mimetypes` for phone gallery
     * files (empty / octet-stream / MOV sniffed as MP4).
     *
     * @return list<string>
     */
    public static function fileRules(): array
    {
        return [
            'required',
            'file',
            'mimes:'.implode(',', self::EXTENSIONS),
        ];
    }

    public static function isAllowedExtension(?string $extension): bool
    {
        if ($extension === null || $extension === '') {
            return false;
        }

        return in_array(strtolower($extension), self::EXTENSIONS, true);
    }

    public static function isAllowedMime(?string $mime): bool
    {
        if ($mime === null || $mime === '') {
            return false;
        }

        $normalized = strtolower(trim($mime));

        return in_array($normalized, self::MIMES, true);
    }

    /**
     * Resolve storage extension from client hints + binary sniff.
     */
    public static function resolveExtension(
        string $absolutePath,
        ?string $clientFilename = null,
        ?string $clientMime = null,
    ): string {
        $fromName = self::extensionFromFilename($clientFilename);
        if (self::isAllowedExtension($fromName) && $fromName !== '3gpp') {
            return $fromName === '3gp' ? '3gp' : $fromName;
        }
        if ($fromName === '3gpp') {
            return '3gp';
        }

        $sniffed = self::sniffExtension($absolutePath);
        if ($sniffed !== null) {
            return $sniffed;
        }

        $fromMime = self::extensionForMime($clientMime);
        if ($fromMime !== null) {
            return $fromMime;
        }

        return 'mp4';
    }

    public static function contentTypeForExtension(string $extension): string
    {
        return match (strtolower($extension)) {
            'mov' => 'video/quicktime',
            'webm' => 'video/webm',
            'm4v' => 'video/x-m4v',
            '3gp', '3gpp' => 'video/3gpp',
            default => 'video/mp4',
        };
    }

    /**
     * Reject non-video assemblies before storing (multipart path has no per-part mime).
     *
     * @throws ValidationException
     */
    public static function assertLooksLikeVideo(string $absolutePath): void
    {
        if (! is_file($absolutePath) || filesize($absolutePath) < 12) {
            throw ValidationException::withMessages([
                'file' => ['Uploaded file is empty or too small to be a video.'],
            ]);
        }

        if (self::sniffExtension($absolutePath) !== null) {
            return;
        }

        $mime = self::finfoMime($absolutePath);
        if ($mime && str_starts_with($mime, 'video/')) {
            return;
        }

        throw ValidationException::withMessages([
            'file' => ['Please upload a phone video (MP4, MOV, M4V, WebM, or 3GP).'],
        ]);
    }

    /**
     * Soft check for an UploadedFile (single-shot media upload helper messages).
     */
    public static function uploadedFileLooksAllowed(UploadedFile $file): bool
    {
        $ext = strtolower((string) $file->getClientOriginalExtension());
        $mime = strtolower((string) ($file->getMimeType() ?: $file->getClientMimeType()));

        if (self::isAllowedExtension($ext)) {
            return true;
        }

        return self::isAllowedMime($mime) && $mime !== 'application/octet-stream';
    }

    public static function extensionFromFilename(?string $filename): ?string
    {
        if ($filename === null || $filename === '') {
            return null;
        }

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return $ext !== '' ? $ext : null;
    }

    public static function extensionForMime(?string $mime): ?string
    {
        if ($mime === null || $mime === '') {
            return null;
        }

        return match (strtolower(trim($mime))) {
            'video/quicktime' => 'mov',
            'video/webm' => 'webm',
            'video/x-m4v' => 'm4v',
            'video/3gpp', 'video/3gpp2' => '3gp',
            'video/mp4', 'video/hevc', 'video/h265' => 'mp4',
            default => null,
        };
    }

    /**
     * Container sniff from magic / ftyp brand (works for iOS MOV + Android MP4/3GP).
     */
    public static function sniffExtension(string $absolutePath): ?string
    {
        $handle = @fopen($absolutePath, 'rb');
        if ($handle === false) {
            return null;
        }

        try {
            $head = fread($handle, 64);
        } finally {
            fclose($handle);
        }

        if (! is_string($head) || strlen($head) < 12) {
            return null;
        }

        // EBML → WebM / Matroska
        if (str_starts_with($head, "\x1A\x45\xDF\xA3")) {
            return 'webm';
        }

        // ISO BMFF: size(4) + 'ftyp'(4) + brand(4)
        if (substr($head, 4, 4) !== 'ftyp') {
            $mime = self::finfoMime($absolutePath);
            if ($mime === 'video/webm') {
                return 'webm';
            }
            if ($mime === 'video/quicktime') {
                return 'mov';
            }
            if (is_string($mime) && str_starts_with($mime, 'video/')) {
                return self::extensionForMime($mime) ?? 'mp4';
            }

            return null;
        }

        $brand = strtolower(substr($head, 8, 4));

        if (str_starts_with($brand, '3gp') || str_starts_with($brand, '3g2')) {
            return '3gp';
        }

        if (in_array($brand, ['qt  ', 'qt'], true) || str_contains($brand, 'qt')) {
            return 'mov';
        }

        if (in_array($brand, ['m4v ', 'm4v'], true) || str_starts_with($brand, 'm4v')) {
            return 'm4v';
        }

        // isom / mp41 / mp42 / avc1 / hev1 / hvc1 / etc.
        return 'mp4';
    }

    private static function finfoMime(string $absolutePath): ?string
    {
        if (! class_exists(\finfo::class)) {
            return null;
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($absolutePath);

        return is_string($mime) ? strtolower($mime) : null;
    }
}
