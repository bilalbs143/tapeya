<?php

namespace App\Http\Resources\v1\System;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSystemInfoResource extends JsonResource
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
        ];
    }
}
