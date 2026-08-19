<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class HeroSliderCtaUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        $isHttpUrl = preg_match('/^https?:\/\//i', $value) === 1
            && filter_var($value, FILTER_VALIDATE_URL) !== false;
        $isAppPath = preg_match('#^/(?!/)\S*$#', $value) === 1;

        if (! $isHttpUrl && ! $isAppPath) {
            $fail('The CTA URL must be an http(s) link or an in-app path starting with / (e.g. /upcoming-tournaments).');
        }
    }
}
