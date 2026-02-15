<?php

namespace App\Casts;

use Exception;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * Casts a model attribute to/from a stored file path and returns a full URL when reading.
 *
 * Follows the same pattern as laravel/popups: store uploads via ->store($path, $disk),
 * return URL via Storage::disk($disk)->url($value). For web-accessible images (hero sliders,
 * popups, etc.) use the 'public' disk and run `php artisan storage:link`.
 *
 * Parameters (comma-separated after the first colon, e.g. AsFile::class.':hero-sliders,false,public'):
 *   - basePath: directory under the disk (default: 'images')
 *   - useModelSegment: append model kebab name to path (default: true; pass 'false' for a flat path)
 *   - disk: 'public' for web-accessible (served at /storage/...), 'local' for private (default)
 */
class AsFile implements CastsAttributes
{
    private bool $useModelSegment = true;

    /** @var string Disk name for store/url (e.g. 'public' for web-accessible, 'local' for private). */
    private string $disk = 'local';

    public function __construct(
        public string $basePath = 'images',
        bool|string $useModelSegment = true,
        string $disk = 'local',
    ) {
        $this->useModelSegment = $useModelSegment !== false && strtolower((string) $useModelSegment) !== 'false';
        $this->disk = ($disk === 'media') ? config('filesystems.media_disk', 'public') : ($disk ?: 'local');
    }

    /**
     * Cast the given value to a full URL so clients (e.g. admin panel on another origin)
     * can load the file regardless of driver (local, s3, etc.). Relative paths are
     * converted to absolute using the app URL.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if (! $value) {
            return null;
        }

        $url = Storage::disk($this->disk)->url($value);

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return URL::to($url);
    }

    /**
     * Prepare the given value for storage.
     * Accepts UploadedFile (stores to disk) or string path (saves as-is, for controller pre-stored files).
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if (! $value) {
            return null;
        }

        if (is_string($value)) {
            return $value;
        }

        if (isset($attributes[$key])) {
            try {
                Storage::disk($this->disk)->delete($attributes[$key]);
            } catch (Exception $e) {
                // do nothing
            }
        }

        $path = $this->useModelSegment
            ? "{$this->basePath}/{$model->kebab()}"
            : $this->basePath;

        return $value->store($path, $this->disk);
    }
}
