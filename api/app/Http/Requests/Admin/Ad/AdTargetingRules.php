<?php

namespace App\Http\Requests\Admin\Ad;

use Illuminate\Validation\Validator;

final class AdTargetingRules
{
    public const PLATFORMS = ['ios', 'android', 'web'];

    /**
     * @return array<string, mixed>
     */
    public static function rules(string $prefix = 'targeting_json'): array
    {
        return [
            $prefix => ['nullable', 'array'],
            $prefix.'.platforms' => ['sometimes', 'array'],
            $prefix.'.platforms.*' => ['string', 'in:'.implode(',', self::PLATFORMS)],
            $prefix.'.countries' => ['sometimes', 'array'],
            $prefix.'.countries.*' => ['string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
        ];
    }

    /**
     * Normalize country codes to uppercase ISO-3166-1 alpha-2.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function normalize(array $data, string $field = 'targeting_json'): array
    {
        $targeting = $data[$field] ?? null;
        if (! is_array($targeting) || ! isset($targeting['countries']) || ! is_array($targeting['countries'])) {
            return $data;
        }

        $targeting['countries'] = array_values(array_filter(array_map(
            static fn ($code) => strtoupper(trim((string) $code)),
            $targeting['countries'],
        )));
        $data[$field] = $targeting;

        return $data;
    }

    public static function rejectUnknownKeys(Validator $validator, string $field = 'targeting_json'): void
    {
        $targeting = $validator->getData()[$field] ?? null;
        if (! is_array($targeting)) {
            return;
        }

        $allowed = ['platforms', 'countries'];
        $unknown = array_diff(array_keys($targeting), $allowed);
        if ($unknown !== []) {
            $validator->errors()->add($field, 'Unknown targeting keys: '.implode(', ', $unknown));
        }
    }
}
