<?php

namespace App\Http\Requests\User\Ad;

use App\Enums\Ad\AdEventTypeEnum;
use App\Enums\Ad\AdSurfaceEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'events' => ['required', 'array', 'min:1', 'max:50'],
            'events.*.client_event_id' => ['required', 'uuid'],
            'events.*.type' => ['required', Rule::enum(AdEventTypeEnum::class)],
            'events.*.creative_id' => ['required', 'integer', 'exists:ad_creatives,id'],
            'events.*.campaign_id' => ['required', 'integer', 'exists:ad_campaigns,id'],
            'events.*.surface' => ['required', Rule::enum(AdSurfaceEnum::class)],
            'events.*.platform' => ['nullable', 'string', 'max:32'],
            'events.*.occurred_at' => ['required', 'date'],
            'events.*.watched_ms' => ['nullable', 'integer', 'min:0'],
            'events.*.completion_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'events.*.take_id' => ['nullable', 'integer', 'exists:live_ad_takes,id'],
            'events.*.meta' => ['nullable', 'array'],
        ];
    }
}
