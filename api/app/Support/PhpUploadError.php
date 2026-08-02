<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

final class PhpUploadError
{
    /**
     * Human-readable message for a failed PHP upload (before Laravel validation).
     */
    public static function message(?UploadedFile $file): ?string
    {
        if ($file === null) {
            $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
            $postMax = self::iniBytes('post_max_size');
            if ($contentLength > 0 && $postMax > 0 && $contentLength > $postMax) {
                return 'Upload exceeds PHP post_max_size ('.self::ini('post_max_size').'). Restart `php artisan serve` after raising limits.';
            }

            return 'No file received. Check PHP post_max_size / upload_max_filesize and restart the API server.';
        }

        if ($file->isValid()) {
            return null;
        }

        return match ($file->getError()) {
            UPLOAD_ERR_INI_SIZE => 'File exceeds PHP upload_max_filesize ('.self::ini('upload_max_filesize').'). Restart `php artisan serve` after raising limits in php.ini.',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds the form MAX_FILE_SIZE limit.',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded. Retry.',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing PHP temporary upload directory.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write uploaded file to disk (check free space / permissions).',
            UPLOAD_ERR_EXTENSION => 'A PHP extension blocked the upload.',
            default => 'The file failed to upload (PHP error '.$file->getError().').',
        };
    }

    private static function ini(string $key): string
    {
        $value = ini_get($key);

        return is_string($value) && $value !== '' ? $value : 'unknown';
    }

    private static function iniBytes(string $key): int
    {
        $value = trim((string) ini_get($key));
        if ($value === '' || $value === '0') {
            return 0;
        }

        $unit = strtolower(substr($value, -1));
        $num = (float) $value;

        return (int) match ($unit) {
            'g' => $num * 1024 * 1024 * 1024,
            'm' => $num * 1024 * 1024,
            'k' => $num * 1024,
            default => $num,
        };
    }
}
