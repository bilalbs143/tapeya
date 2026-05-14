<?php

namespace App\Http\Requests\Admin\SystemSetting;

use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Settings\SystemSettingRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSystemSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $key = SystemSettingKeyEnum::tryFrom((string) $this->route('key'));
        SystemSettingRegistry::prepareForValidation($this, $key);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $key = SystemSettingKeyEnum::tryFrom((string) $this->route('key'));
            SystemSettingRegistry::afterValidation($v, $key, $this->input('value'));
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $key = SystemSettingKeyEnum::tryFrom((string) $this->route('key'));
        if (! $key) {
            abort(404, 'Unknown System Setting Key.');
        }

        return SystemSettingRegistry::rules($key);
    }
}
