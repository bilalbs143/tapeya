<?php

namespace App\Http\Requests\Admin\Event;

use App\Enums\Event\EventRequestStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequestRequest extends FormRequest
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
            'status' => ['required', Rule::enum(EventRequestStatusEnum::class)],
        ];
    }
}
