<?php

namespace App\Http\Requests\v1\Admin\Note;

use App\Enums\Note\NoteCategoryEnum;
use App\Enums\User\UserTypeEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_NOTE');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                // Rule::unique('notes')->where('category', $this->category)->withoutTrashed(),
            ],
            'content' => 'required',
            'is_active' => 'sometimes|boolean',
            'category' => ['required', Rule::enum(NoteCategoryEnum::class)],
            'agent_id' => ['required_without:user_id', Rule::exists('users', 'id')->withoutTrashed()->where('type', UserTypeEnum::AGENT)],
            'user_id' => ['required_without:agent_id', Rule::exists('users', 'id')->withoutTrashed()->where('type', UserTypeEnum::USER)],
        ];
    }
}
