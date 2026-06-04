<?php

namespace App\Http\Requests\Admin\Push;

use Illuminate\Foundation\Http\FormRequest;

class SendPushNotificationRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:100'],
            'body' => ['required', 'string', 'max:200'],
            'image_url' => ['nullable', 'string', 'url', 'max:2048'],
        ];
    }
}
