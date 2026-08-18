<?php

namespace Database\Factories;

use App\Enums\Streaming\StreamOrientationEnum;
use App\Models\LiveStream;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LiveStream>
 */
class LiveStreamFactory extends Factory
{
    protected $model = LiveStream::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'match_id' => null,
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->sentence(),
            'orientation' => StreamOrientationEnum::Portrait,
            'streaming_url' => 'https://example.com/stream/'.Str::random(8),
            'provider' => 'external',
            'status' => 'idle',
            'created_by' => User::factory(),
        ];
    }
}
