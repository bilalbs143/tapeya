<?php

namespace App\Http\Resources\v1\System;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemInfoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'version' => env('APP_VERSION'),
            'timezone' => env('APP_TIMEZONE'),
            'app_url' => env('APP_URL'),
        ];
    }
}
