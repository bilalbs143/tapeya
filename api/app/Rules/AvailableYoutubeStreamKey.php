<?php

namespace App\Rules;

use App\Models\YoutubeStreamKey;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * youtube_stream_key_id must exist, be active, and not be held by another non-ended session.
 * Pass $excludingStreamId when replacing credentials on an existing stream.
 */
class AvailableYoutubeStreamKey implements ValidationRule
{
    public function __construct(private readonly ?int $excludingStreamId = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $key = YoutubeStreamKey::find($value);

        if (! $key) {
            $fail('Selected YouTube key does not exist.');

            return;
        }

        if (! $key->is_active) {
            $fail('Selected YouTube key is inactive.');

            return;
        }

        if ($key->isInUse($this->excludingStreamId)) {
            $fail("Selected YouTube key (\"{$key->title}\") is currently in use by another live stream.");
        }
    }
}
