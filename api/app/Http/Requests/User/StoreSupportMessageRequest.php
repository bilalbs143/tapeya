<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupportMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $phone = $this->input('phone');
        $message = $this->input('message');

        $this->merge([
            'name' => is_string($name) ? trim($name) : $name,
            'phone' => is_string($phone) ? trim($phone) : $phone,
            'message' => is_string($message) ? trim($message) : $message,
        ]);

        if ($this->input('phone') === '') {
            $this->merge(['phone' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'min:10', 'max:10000'],
            'attachment' => ['nullable', 'file', 'max:5120', 'mimes:jpg,jpeg,png,gif,webp,pdf'],
        ];
    }
}
