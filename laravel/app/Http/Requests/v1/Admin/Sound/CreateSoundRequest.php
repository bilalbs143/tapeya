<?php

namespace App\Http\Requests\v1\Admin\Sound;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateSoundRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_SOUND');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', Rule::unique('sounds')->withoutTrashed()],
            'file' => ['required', 'file', 'mimes:application/octet-stream,audio/mpeg,mpga,mp3,wav'],
        ];
    }
}
