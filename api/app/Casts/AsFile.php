<?php

namespace App\Casts;

use App\Support\Media\MediaDisk;
use Exception;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * Casts a model attribute to/from a stored file path and returns a full URL when reading.
 *
 * Store uploads via {@see MediaDisk} (ACL-safe for BucketOwnerEnforced S3/B2).
 * For web-facing images use disk alias `media` → config('filesystems.media_disk').
 *
 * Parameters (comma-separated after the first colon, e.g. AsFile::class.':hero-sliders,false,media'):
 *   - basePath: directory under the disk (default: 'images')
 *   - useModelSegment: append model kebab name to path (default: true; pass 'false' for a flat path)
 *   - disk: 'media' for media_disk, or an explicit disk name (prefer 'media' in production)
 */
class AsFile implements CastsAttributes
{
    private bool $useModelSegment = true;

    /** @var string Disk name for store/url (e.g. 'media' → media_disk). */
    private string $disk = 'local';

    private bool $usesMediaDisk = false;

    public function __construct(
        public string $basePath = 'images',
        bool|string $useModelSegment = true,
        string $disk = 'local',
    ) {
        $this->useModelSegment = $useModelSegment !== false && strtolower((string) $useModelSegment) !== 'false';
        $this->usesMediaDisk = $disk === 'media';
        $this->disk = $this->usesMediaDisk ? MediaDisk::name() : ($disk ?: 'local');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if (! $value) {
            return null;
        }

        $url = $this->usesMediaDisk
            ? MediaDisk::url(is_string($value) ? $value : null)
            : Storage::disk($this->disk)->url($value);

        if ($url === null) {
            return null;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return URL::to($url);
    }

    /**
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

        if (! $value instanceof UploadedFile) {
            return null;
        }

        if (isset($attributes[$key])) {
            try {
                if ($this->usesMediaDisk) {
                    MediaDisk::delete(is_string($attributes[$key]) ? $attributes[$key] : null);
                } else {
                    Storage::disk($this->disk)->delete($attributes[$key]);
                }
            } catch (Exception $e) {
                // do nothing
            }
        }

        $path = $this->useModelSegment
            ? "{$this->basePath}/{$model->kebab()}"
            : $this->basePath;

        if ($this->usesMediaDisk) {
            return MediaDisk::storeUploaded($value, $path);
        }

        return MediaDisk::requirePath($value->store($path, $this->disk));
    }
}
