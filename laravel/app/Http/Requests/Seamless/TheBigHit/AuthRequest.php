<?php

namespace App\Http\Requests\Seamless\TheBigHit;

use App\Models\UserGameSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AuthRequest extends FormRequest
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
            'requestid' => 'required|string',
            'token' => ['required', 'string', Rule::exists(UserGameSession::class, 'token')],
            'signature' => 'required|string',
        ];
    }
}
