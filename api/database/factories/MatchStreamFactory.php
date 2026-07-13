<?php

namespace Database\Factories;

use App\Models\MatchStream;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MatchStream>
 */
class MatchStreamFactory extends Factory
{
    protected $model = MatchStream::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'match_id' => null,
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->sentence(),
            'streaming_url' => 'https://example.com/stream/'.Str::random(8),
            'provider' => 'external',
            'status' => 'idle',
            'created_by' => User::factory(),
        ];
    }
}
