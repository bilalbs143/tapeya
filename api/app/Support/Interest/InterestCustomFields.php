<?php

namespace App\Support\Interest;

use App\Enums\Tournament\TournamentInterestCustomFieldTypeEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class InterestCustomFields
{
    public const DEFAULT_ID_DOCUMENT_ID = 'id_document';

    /**
     * Default campaign custom fields — empty; CNIC lives on form_fields (`id_document`).
     *
     * @return list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>
     */
    public static function defaults(): array
    {
        return [];
    }

    /**
     * Normalize admin/client custom field payloads. Ids are optional — derived from label
     * when missing. Pass $previous on update to keep stable keys across renames/reorders
     * when possible.
     *
     * @param  list<array{id?: string, type: string, label: string, required?: bool, options?: list<string>}>|null  $previous
     * @return list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>
     */
    public static function normalize(mixed $raw, ?array $previous = null): array
    {
        if (! is_array($raw)) {
            return [];
        }

        $previous = is_array($previous) ? array_values($previous) : [];
        $previousByLabel = [];
        foreach ($previous as $prior) {
            if (! is_array($prior)) {
                continue;
            }
            $priorId = self::sanitizeId($prior['id'] ?? null);
            $priorLabel = is_string($prior['label'] ?? null) ? strtolower(trim($prior['label'])) : '';
            if ($priorId !== null && $priorLabel !== '' && ! isset($previousByLabel[$priorLabel])) {
                $previousByLabel[$priorLabel] = $priorId;
            }
        }

        $fields = [];
        $seen = [];

        foreach (array_values($raw) as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $type = is_string($item['type'] ?? null) ? trim($item['type']) : '';
            $label = is_string($item['label'] ?? null) ? trim($item['label']) : '';

            if ($label === '' || ! TournamentInterestCustomFieldTypeEnum::tryFrom($type)) {
                continue;
            }

            $labelKey = strtolower($label);
            $id = self::sanitizeId($item['id'] ?? null)
                ?? ($previousByLabel[$labelKey] ?? null)
                ?? self::sanitizeId($previous[$index]['id'] ?? null)
                ?? self::idFromLabel($label, array_keys($seen));

            if (isset($seen[$id])) {
                $id = self::idFromLabel($label, array_keys($seen));
            }
            $seen[$id] = true;

            $required = array_key_exists('required', $item)
                ? filter_var($item['required'], FILTER_VALIDATE_BOOLEAN)
                : true;

            $field = [
                'id' => $id,
                'type' => $type,
                'label' => Str::limit($label, 191, ''),
                'required' => $required,
            ];

            if ($type === TournamentInterestCustomFieldTypeEnum::SELECT->value) {
                $field['options'] = self::normalizeOptions($item['options'] ?? []);
            }

            $fields[] = $field;
        }

        return $fields;
    }

    /**
     * Null stored value → legacy defaults. Explicit empty array stays empty.
     *
     * @param  list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>|null  $fields
     * @return list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>
     */
    public static function resolve(?array $fields): array
    {
        return $fields === null ? self::defaults() : self::normalize($fields);
    }

    /**
     * @param  list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>  $fields
     */
    public static function find(array $fields, string $id): ?array
    {
        foreach ($fields as $field) {
            if (($field['id'] ?? null) === $id) {
                return $field;
            }
        }

        return null;
    }

    /**
     * Merge non-file answers into existing answers (file paths stay untouched).
     *
     * @param  list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>  $fields
     * @param  array<string, string>  $existing
     * @param  array<string, mixed>  $incoming
     * @return array<string, string>
     */
    public static function mergeScalarAnswers(array $fields, array $existing, array $incoming): array
    {
        $merged = $existing;

        foreach ($fields as $field) {
            $id = $field['id'];
            if (($field['type'] ?? null) === TournamentInterestCustomFieldTypeEnum::FILE->value) {
                continue;
            }
            if (! array_key_exists($id, $incoming)) {
                continue;
            }

            $value = trim((string) $incoming[$id]);
            if ($value === '') {
                unset($merged[$id]);
            } else {
                $merged[$id] = Str::limit($value, 191, '');
            }
        }

        return $merged;
    }

    /**
     * @param  list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>  $fields
     * @return array<string, string>
     */
    public static function normalizeAnswers(array $fields, mixed $answers): array
    {
        if (! is_array($answers)) {
            return [];
        }

        $allowed = array_column($fields, 'id');
        $out = [];

        foreach ($answers as $key => $value) {
            if (! is_string($key) || ! in_array($key, $allowed, true)) {
                continue;
            }
            if (! is_string($value) && ! is_numeric($value)) {
                continue;
            }
            $trimmed = trim((string) $value);
            if ($trimmed === '') {
                continue;
            }
            $out[$key] = Str::limit($trimmed, 191, '');
        }

        return $out;
    }

    /**
     * @param  list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>  $fields
     * @return array<string, mixed>
     */
    public static function answerRules(array $fields): array
    {
        $rules = ['custom_answers' => ['sometimes', 'array']];

        foreach ($fields as $field) {
            if (($field['type'] ?? null) === TournamentInterestCustomFieldTypeEnum::FILE->value) {
                continue;
            }

            $key = 'custom_answers.'.$field['id'];
            $required = (bool) ($field['required'] ?? true);
            $base = $required ? ['required', 'string', 'max:191'] : ['nullable', 'string', 'max:191'];

            if (($field['type'] ?? null) === TournamentInterestCustomFieldTypeEnum::SELECT->value) {
                $base[] = Rule::in($field['options'] ?? []);
            }

            $rules[$key] = $base;
        }

        return $rules;
    }

    /**
     * @return array<string, mixed>
     */
    public static function adminRules(): array
    {
        return [
            'custom_fields' => ['sometimes', 'array', 'max:30'],
            // Optional — server derives from label when omitted.
            'custom_fields.*.id' => ['sometimes', 'nullable', 'string', 'max:64'],
            'custom_fields.*.type' => ['required', 'string', Rule::enum(TournamentInterestCustomFieldTypeEnum::class)],
            'custom_fields.*.label' => ['required', 'string', 'max:191'],
            'custom_fields.*.required' => ['sometimes', 'boolean'],
            'custom_fields.*.options' => ['sometimes', 'array', 'max:50'],
            'custom_fields.*.options.*' => ['string', 'max:191'],
        ];
    }

    public static function sanitizeId(mixed $raw): ?string
    {
        if (! is_string($raw)) {
            return null;
        }

        $id = strtolower(trim($raw));
        if ($id === '' || ! preg_match('/^[a-z][a-z0-9_]{0,63}$/', $id)) {
            return null;
        }

        $reserved = [
            ...TournamentInterestFormFieldEnum::values(),
            'custom_answers',
            'status',
        ];

        return in_array($id, $reserved, true) ? null : $id;
    }

    /**
     * @param  list<string>  $existingIds
     */
    public static function idFromLabel(string $label, array $existingIds = []): string
    {
        $base = Str::slug($label, '_');
        $base = preg_replace('/[^a-z0-9_]/', '', strtolower($base ?? '')) ?: 'field';
        if (! preg_match('/^[a-z]/', $base)) {
            $base = 'f_'.$base;
        }
        $base = substr($base, 0, 64);

        $candidate = $base;
        $i = 2;
        while (in_array($candidate, $existingIds, true) || self::sanitizeId($candidate) === null) {
            $suffix = '_'.$i;
            $candidate = substr($base, 0, 64 - strlen($suffix)).$suffix;
            $i++;
        }

        return $candidate;
    }

    /**
     * @return list<string>
     */
    public static function normalizeOptions(mixed $raw): array
    {
        if (! is_array($raw)) {
            return [];
        }

        $options = [];
        foreach ($raw as $value) {
            if (! is_string($value)) {
                continue;
            }
            $trimmed = trim($value);
            if ($trimmed === '' || in_array($trimmed, $options, true)) {
                continue;
            }
            $options[] = Str::limit($trimmed, 191, '');
        }

        return $options;
    }
}
