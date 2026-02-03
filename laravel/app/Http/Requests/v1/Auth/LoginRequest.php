<?php

namespace App\Http\Requests\v1\Auth;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => 'required',
            'password' => 'required',
        ];
    }

    public function authenticate(): bool
    {
        return Auth::attempt([
            ...$this->validated(),
            fn (Builder $query) => $query->active(),
        ], request()->remember);
    }

    public function attributes(): array
    {
        return [
            'username' => 'ID',
        ];
    }
}
