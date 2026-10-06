<?php

namespace App\Http\Requests\Admin\Drama;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Rules\YouTubeUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDramaEpisodeRequest extends FormRequest
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
            'drama_serial_id' => ['required', 'integer', 'exists:drama_serials,id'],
            'episode_number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('drama_episodes', 'episode_number')->where(
                    fn ($q) => $q->where('drama_serial_id', $this->input('drama_serial_id'))
                ),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'video_source' => ['required', Rule::enum(DramaVideoSourceEnum::class)],
            'video' => [
                'exclude_unless:video_source,'.DramaVideoSourceEnum::YOUTUBE->value,
                'required_if:video_source,'.DramaVideoSourceEnum::YOUTUBE->value,
                'string',
                'max:2048',
                new YouTubeUrl,
            ],
            'duration' => ['nullable', 'string', 'max:32'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
