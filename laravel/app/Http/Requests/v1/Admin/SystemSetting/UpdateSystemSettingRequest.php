<?php

namespace App\Http\Requests\v1\Admin\SystemSetting;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_SYSTEM_SETTING');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $key = $this->route('systemSetting') ?? $this->route('key');

        $nullableKeys = [
            'live_chat_html_code',
            'tracking_html_code',
        ];

        // Convert empty strings to null for nullable keys
        if (in_array($key, $nullableKeys)) {
            $value = $this->input('value');
            if ($value === '' || (is_string($value) && trim($value) === '')) {
                $this->merge(['value' => null]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $key = $this->route('systemSetting') ?? $this->route('key');

        $nullableKeys = [
            'live_chat_html_code',
            'tracking_html_code',
        ];

        if (in_array($key, $nullableKeys)) {
            return [
                'value' => 'nullable',
            ];
        }

        return [
            'value' => 'required',
        ];
    }
}
