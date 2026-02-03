<?php

namespace App\Http\Requests\v1\Admin\Sound;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSoundRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_SOUND');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', Rule::unique('sounds')->ignore($this->sound)->withoutTrashed()],
            'file' => ['sometimes', 'file', 'mimes:application/octet-stream,audio/mpeg,mpga,mp3,wav'],
        ];
    }
}
