<?php

namespace App\Http\Requests\v1\Admin\Announcement;

use App\Enums\Announcement\AnnouncementCategoryEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAnnouncementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_ANNOUNCEMENT');
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
                'sometimes',
                'string',
                Rule::unique('announcements')->where('category', $this->category)->ignore($this->announcement)->withoutTrashed(),
            ],
            'is_active' => 'sometimes|boolean',
            'content' => 'sometimes',
            'category' => ['sometimes', Rule::enum(AnnouncementCategoryEnum::class)],
            'is_important' => 'sometimes|boolean',
        ];
    }
}
