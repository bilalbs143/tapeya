<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Ends an active match break (marks ended_at = now).
 * No request body fields are required — the action is fully determined by the route.
 */
class EndMatchBreakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [];
    }
}
