<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Ad\LiveAdTakeModeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StartLiveAdTakeRequest extends FormRequest
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
            'creative_id' => ['required', 'integer', 'exists:ad_creatives,id'],
            'mode' => ['required', Rule::enum(LiveAdTakeModeEnum::class)],
            'stream_ids' => ['required', 'array', 'min:1'],
            'stream_ids.*' => ['integer', 'exists:live_streams,id'],
            'replace' => ['sometimes', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
            'presentation' => ['nullable', 'array'],
            'presentation_json' => ['nullable', 'array'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('presentation') && ! $this->has('presentation_json')) {
            $this->merge(['presentation_json' => $this->input('presentation')]);
        }
    }
}
