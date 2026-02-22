<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\DatabaseNotification;

/**
 * @mixin DatabaseNotification
 */
class NotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->data;

        return [
            'id' => $this->id,
            'type' => is_array($data) ? ($data['type'] ?? null) : null,
            'data' => $data,
            'read_at' => $this->read_at?->toIso8601String(),
            'read_by' => $this->read_by ?? null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
