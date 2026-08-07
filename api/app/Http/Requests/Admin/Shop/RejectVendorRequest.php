<?php

namespace App\Http\Requests\Admin\Shop;

use Illuminate\Foundation\Http\FormRequest;

class RejectVendorRequest extends FormRequest
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
            'rejection_reason' => ['nullable', 'string', 'max:2000'],
            'suspension_reason' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function reason(): ?string
    {
        $data = $this->validated();

        return $data['rejection_reason'] ?? $data['suspension_reason'] ?? null;
    }
}
