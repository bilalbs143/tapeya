<?php

namespace App\Http\Requests\v1\Admin\SoundSettings;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateSoundSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_SOUND_SETTING');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => [
                'required',
                'string',
                Rule::enum(SoundSettingsTypeEnum::class),
                Rule::unique('sound_settings')->withoutTrashed(),
            ],
            'sound_id' => [
                'required',
                Rule::exists('sounds', 'id')->withoutTrashed(),
                Rule::unique('sound_settings')->where('type', $this->type)->withoutTrashed(),
            ],
        ];
    }
}
