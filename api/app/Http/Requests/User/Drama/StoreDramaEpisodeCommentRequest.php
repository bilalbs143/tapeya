<?php

namespace App\Http\Requests\User\Drama;

use Illuminate\Foundation\Http\FormRequest;

class StoreDramaEpisodeCommentRequest extends FormRequest
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
            'body' => ['required', 'string', 'max:500'],
            'parent_id' => ['nullable', 'integer', 'exists:drama_episode_comments,id'],
        ];
    }
}
