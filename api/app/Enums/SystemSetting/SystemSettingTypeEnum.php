<?php

namespace App\Enums\SystemSetting;

use App\Enums\BaseEnumTrait;
use App\Services\Notifications\SmsSender;
use Illuminate\Validation\ValidationException;

/**
 * Value shapes for the admin system-settings API (field types and validation).
 */
enum SystemSettingTypeEnum: string
{
    use BaseEnumTrait;

    case STRING = 'string';
    case TEXT = 'text';
    case INTEGER = 'integer';

    public function label(): string
    {
        return match ($this) {
            self::STRING => 'String',
            self::TEXT => 'Text',
            self::INTEGER => 'Integer',
        };
    }

    /**
     * @param  mixed  $value  Incoming value from validated request (string, null, etc.)
     */
    public function validateValue(mixed $value): void
    {
        match ($this) {
            self::STRING => $this->assertStringOrNull($value),
            self::TEXT => $this->assertStringOrNull($value),
            self::INTEGER => $this->assertIntegerLikeOrNull($value),
        };
    }

    public function fieldType(): string
    {
        return match ($this) {
            self::STRING => 'text',
            self::TEXT => 'textarea',
            self::INTEGER => 'number',
        };
    }

    /**
     * @return array<int, string>
     */
    public function getPossibleValues(SystemSettingKeyEnum $key): array
    {
        return match ($key) {
            SystemSettingKeyEnum::SMS_DRIVER => SmsSender::configuredDriverNames(),
            default => [],
        };
    }

    private function assertStringOrNull(mixed $value): void
    {
        if ($value !== null && ! is_string($value)) {
            throw ValidationException::withMessages([
                'value' => 'The value must be a string or null.',
            ]);
        }
    }

    private function assertIntegerLikeOrNull(mixed $value): void
    {
        if ($value === null) {
            return;
        }

        if (is_int($value)) {
            return;
        }

        if (is_string($value) && $value !== '' && preg_match('/^-?\d+$/', $value)) {
            return;
        }

        throw ValidationException::withMessages([
            'value' => 'The value must be an integer or null.',
        ]);
    }
}
