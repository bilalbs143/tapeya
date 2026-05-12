<?php

namespace App\Http\Requests\Admin;

use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentInterestSubmissionRequest extends FormRequest
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
            'status' => ['sometimes', Rule::enum(TournamentInterestSubmissionStatusEnum::class)],
        ];
    }
}
