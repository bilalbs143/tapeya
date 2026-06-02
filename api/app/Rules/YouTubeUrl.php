<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class YouTubeUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            $fail('A valid YouTube URL is required.');

            return;
        }

        if (! preg_match('/youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/', $value)) {
            $fail('The :attribute must be a YouTube embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID).');
        }
    }
}
