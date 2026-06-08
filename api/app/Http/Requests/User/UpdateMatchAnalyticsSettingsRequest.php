<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchAnalyticsSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'wagon_wheel_enabled' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * At least one setting must be provided.
     * A request with an empty body is a client error, not a no-op.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->has('wagon_wheel_enabled')) {
                $validator->errors()->add(
                    'settings',
                    'At least one analytics setting must be provided.',
                );
            }
        });
    }
}
