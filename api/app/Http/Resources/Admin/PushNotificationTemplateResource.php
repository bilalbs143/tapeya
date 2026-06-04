<?php

namespace App\Http\Resources\Admin;

use App\Models\PushNotificationTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PushNotificationTemplate */
class PushNotificationTemplateResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
            'title_template' => $this->title_template,
            'body_template' => $this->body_template,
            'available_variables' => $this->available_variables ?? [],
            'sample_preview_data' => $this->resource->samplePreviewData(),
            'is_active' => $this->is_active,
            'is_editable' => $this->key !== 'manual_broadcast',
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
