<?php

namespace App\Http\Resources\v1\AppRelease;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppReleaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'version' => $this->version,
            'file_url' => $this->file_path,
            'file_name' => $this->file_name,
            'file_size' => $this->file_size,
            'file_hash' => $this->file_hash,
            'mime_type' => $this->mime_type,
            'os' => $this->os?->label(),
            'type' => $this->type?->label(),
            'release_channel' => $this->release_channel?->label(),
            'is_active' => $this->is_active,
            'is_forced' => $this->is_forced,
            'is_critical' => $this->is_critical,
            'release_notes' => $this->release_notes,
            'min_os_version' => $this->min_os_version,
            'supported_devices' => $this->supported_devices,
            'download_count' => $this->download_count,
            'install_count' => $this->install_count,
            'released_at' => $this->released_at,
            'disabled_at' => $this->disabled_at,
            'last_downloaded_at' => $this->last_downloaded_at,
        ];
    }
}
