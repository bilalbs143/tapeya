<?php

namespace App\Http\Resources\Admin;

use App\Models\PushNotificationLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PushNotificationLog */
class PushNotificationLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'template_key' => $this->template_key,
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
            'image_url' => $this->image_url,
            'target_type' => $this->target_type?->value,
            'target_type_label' => $this->target_type?->label(),
            'target_user_id' => $this->target_user_id,
            'target_user' => $this->whenLoaded('targetUser', fn () => [
                'id' => $this->targetUser?->id,
                'name' => $this->targetUser?->name,
            ]),
            'triggered_by' => $this->triggered_by?->value,
            'triggered_by_label' => $this->triggered_by?->label(),
            'sent_by_user_id' => $this->sent_by_user_id,
            'sent_by_user' => $this->whenLoaded('sentByUser', fn () => [
                'id' => $this->sentByUser?->id,
                'name' => $this->sentByUser?->name,
            ]),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'total_tokens' => $this->total_tokens,
            'success_count' => $this->success_count,
            'failure_count' => $this->failure_count,
            'provider' => $this->provider,
            'error_message' => $this->error_message,
            'queued_at' => $this->queued_at?->toIso8601String(),
            'sent_at' => $this->sent_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
