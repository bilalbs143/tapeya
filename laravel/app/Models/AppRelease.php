<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\AppRelease\AppOsEnum;
use App\Enums\AppRelease\AppReleaseChannelEnum;
use App\Enums\AppRelease\AppTypeEnum;
use Illuminate\Support\Facades\Storage;

class AppRelease extends BaseModel
{
    protected $fillable = [
        'major_version',
        'minor_version',
        'patch_version',
        'version',
        'file_path',
        'file_name',
        'file_size',
        'file_hash',
        'mime_type',
        'os',
        'type',
        'release_channel',
        'is_active',
        'is_forced',
        'is_critical',
        'release_notes',
        'min_os_version',
        'supported_devices',
        'download_count',
        'install_count',
        'released_at',
        'disabled_at',
        'last_downloaded_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'os' => AppOsEnum::class,
        'type' => AppTypeEnum::class,
        'release_channel' => AppReleaseChannelEnum::class,
        'file_path' => AsFile::class.':files/app-releases',
        'is_active' => 'boolean',
        'is_forced' => 'boolean',
        'is_critical' => 'boolean',
        'released_at' => 'datetime',
        'disabled_at' => 'datetime',
        'last_downloaded_at' => 'datetime',
    ];

    public function scopeByLatest($query)
    {
        $query->orderBy('id', 'desc');
    }

    public function scopeActive($query)
    {
        $query->where('is_active', true);
    }

    public static function getLastVersionInfo(AppOsEnum $os, AppTypeEnum $type)
    {
        $lastRecord = self::byLatestVersion($os, $type)->first();

        return [
            'major_version' => $lastRecord->major_version ?? 0,
            'minor_version' => $lastRecord->minor_version ?? 0,
            'patch_version' => $lastRecord->patch_version ?? 0,
        ];
    }

    public function scopeByLatestVersion($query, AppOsEnum $os, AppTypeEnum $type)
    {
        return $query->active()->where('os', $os)->where('type', $type)->byLatest();
    }

    public function download()
    {
        $filePath = $this->getAttributes()['file_path'];

        if (! Storage::exists($filePath)) {
            abort(404, 'File not found');
        }

        $this->increment('download_count');
        $this->update(['last_downloaded_at' => now()]);

        $fileName = $this->generateFileName();

        return Storage::download($filePath, $fileName, [
            'Content-Type' => $this->mime_type,
            'Content-Length' => $this->file_size,
            'Cache-Control' => 'no-cache, must-revalidate',
            'Expires' => 'Mon, 26 Jul 1997 05:00:00 GMT',
        ]);
    }

    private function generateFileName(): string
    {
        $osName = strtolower($this->os->value);
        $version = $this->version;
        $extension = $this->os->extension();

        return "app-{$osName}-v{$version}.{$extension}";
    }
}
