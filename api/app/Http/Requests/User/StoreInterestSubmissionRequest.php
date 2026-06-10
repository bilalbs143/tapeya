<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterestSubmissionRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:191'],
            'nickname' => ['required', 'string', 'max:191'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:191'],
            'country' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['required', 'date', 'before:today'],
        ];
    }
}
