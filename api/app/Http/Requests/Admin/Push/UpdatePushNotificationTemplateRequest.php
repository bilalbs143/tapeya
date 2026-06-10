<?php

namespace App\Http\Requests\Admin\Push;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePushNotificationTemplateRequest extends FormRequest
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
            'title_template' => ['sometimes', 'required', 'string', 'max:255'],
            'body_template' => ['sometimes', 'required', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
