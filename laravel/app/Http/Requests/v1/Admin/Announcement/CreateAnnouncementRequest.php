<?php

namespace App\Http\Requests\v1\Admin\Announcement;

use App\Enums\Announcement\AnnouncementCategoryEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateAnnouncementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_ANNOUNCEMENT');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isImportant = $this->boolean('is_important');

        return [
            'title' => [
                $isImportant ? 'nullable' : 'required',
                'string',
                Rule::unique('announcements')->where('category', request()->input('category'))->withoutTrashed(),
            ],
            'is_active' => 'sometimes|boolean',
            'content' => 'required',
            'category' => [
                $isImportant ? 'nullable' : 'required',
                Rule::enum(AnnouncementCategoryEnum::class),
            ],
            'is_important' => 'sometimes|boolean',
        ];
    }
}
