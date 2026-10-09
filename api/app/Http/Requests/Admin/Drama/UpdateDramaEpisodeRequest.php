<?php

namespace App\Http\Requests\Admin\Drama;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Models\DramaEpisode;
use App\Rules\YouTubeUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDramaEpisodeRequest extends FormRequest
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
        /** @var DramaEpisode|null $episode */
        $episode = $this->route('drama_episode');
        $serialId = $this->input('drama_serial_id', $episode?->drama_serial_id);
        $episodeId = $episode?->id;

        return [
            'drama_serial_id' => ['sometimes', 'required', 'integer', 'exists:drama_serials,id'],
            'episode_number' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                Rule::unique('drama_episodes', 'episode_number')
                    ->where(fn ($q) => $q->where('drama_serial_id', $serialId))
                    ->ignore($episodeId),
            ],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'video_source' => ['sometimes', 'required', Rule::enum(DramaVideoSourceEnum::class)],
            'video' => [
                'exclude_unless:video_source,'.DramaVideoSourceEnum::YOUTUBE->value,
                'required_if:video_source,'.DramaVideoSourceEnum::YOUTUBE->value,
                'string',
                'max:2048',
                new YouTubeUrl,
            ],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
