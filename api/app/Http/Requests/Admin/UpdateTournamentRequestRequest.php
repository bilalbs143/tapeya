<?php

namespace App\Http\Requests\Admin;

use App\Enums\Tournament\TournamentRequestStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentRequestRequest extends FormRequest
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
            'status' => ['required', Rule::enum(TournamentRequestStatusEnum::class)],
        ];
    }
}
