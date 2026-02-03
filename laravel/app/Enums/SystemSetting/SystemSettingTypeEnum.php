<?php

namespace App\Enums\SystemSetting;

use App\Enums\BaseEnumTrait;
use App\Exceptions\Seamless\FailureException;
use Illuminate\Support\Arr;
use Throwable;

enum SystemSettingTypeEnum: string
{
    use BaseEnumTrait;

    case BOOLEAN = 'boolean';
    case INTEGER = 'integer';
    case FLOAT = 'float';
    case STRING = 'string';
    case TEXT = 'text';
    case JSON = 'json';
    case DATE = 'date';
    case TIME = 'time';
    case DATETIME = 'datetime';
    case TIMESTAMP = 'timestamp';
    case ENUM = 'enum';

    public function resolveValue(SystemSettingKeyEnum $key, $value)
    {
        return match ($this) {
            self::BOOLEAN => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            self::INTEGER => (int) $value,
            self::FLOAT => (float) $value,
            self::STRING => (string) $value,
            self::TEXT => $value === null ? null : (string) $value,
            self::JSON => json_decode($value, true),
            self::DATE => date('Y-m-d', strtotime($value)),
            self::TIME => date('H:i:s', strtotime($value)),
            self::DATETIME => date('Y-m-d H:i:s', strtotime($value)),
            self::TIMESTAMP => date('Y-m-d H:i:s', strtotime($value)),
            self::ENUM => $key->resolveEnumValue($value),
        };
    }

    public function validateValue(SystemSettingKeyEnum $key, $value)
    {
        match ($this) {
            self::BOOLEAN => $this->validateBooleanValue($value),
            self::INTEGER => $this->validateIntegerValue($value),
            self::FLOAT => $this->validateFloatValue($value),
            self::STRING => $this->validateStringValue($value),
            self::TEXT => $this->validateTextValue($value),
            self::JSON => $this->validateJsonValue($value),
            self::DATE => $this->validateDateValue($value),
            self::TIME => $this->validateTimeValue($value),
            self::DATETIME => $this->validateDatetimeValue($value),
            self::TIMESTAMP => $this->validateTimestampValue($value),
            self::ENUM => $this->validateEnumValue($key, $value),
        };
    }

    private function validateEnumValue(SystemSettingKeyEnum $key, $value)
    {
        try {
            $this->resolveValue($key, $value);
        } catch (Throwable $e) {
            throw new FailureException(msg: __('messages.invalid_enum_value', ['values' => Arr::join($key->getValues(), ', ')]));
        }
    }

    private function validateBooleanValue($value)
    {
        if (! is_bool($value)) {
            throw new FailureException(msg: __('messages.invalid_boolean_value'));
        }
    }

    private function validateIntegerValue($value)
    {
        if (! is_numeric($value)) {
            throw new FailureException(msg: __('messages.invalid_integer_value'));
        }
    }

    private function validateFloatValue($value)
    {
        if (! is_numeric($value)) {
            throw new FailureException(msg: __('messages.invalid_float_value'));
        }
    }

    private function validateStringValue($value)
    {
        if (! is_string($value)) {
            throw new FailureException(msg: __('messages.invalid_string_value'));
        }
    }

    private function validateTextValue($value)
    {
        if ($value !== null && ! is_string($value)) {
            throw new FailureException(msg: __('messages.invalid_text_value'));
        }
    }

    private function validateJsonValue($value)
    {
        if (! is_array($value)) {
            throw new FailureException(msg: __('messages.invalid_json_value'));
        }
    }

    private function validateDateValue($value)
    {
        if (! is_string($value) || ! str_contains($value, '-')) {
            throw new FailureException(msg: __('messages.invalid_date_value'));
        }
    }

    private function validateTimeValue($value)
    {
        if (! is_string($value) || ! str_contains($value, ':')) {
            throw new FailureException(msg: __('messages.invalid_time_value'));
        }
    }

    private function validateDatetimeValue($value)
    {
        if (! is_string($value) || ! str_contains($value, ' ')) {
            throw new FailureException(msg: __('messages.invalid_datetime_value'));
        }
    }

    private function validateTimestampValue($value)
    {
        if (! is_string($value) || ! str_contains($value, ' ')) {
            throw new FailureException(msg: __('messages.invalid_timestamp_value'));
        }
    }

    public function fieldType()
    {
        return match ($this) {
            self::BOOLEAN => 'checkbox',
            self::INTEGER => 'number',
            self::FLOAT => 'number',
            self::STRING => 'text',
            self::TEXT => 'textarea',
            self::STRING => 'text',
            self::JSON => 'json',
            self::DATE => 'date',
            self::TIME => 'time',
            self::DATETIME => 'datetime',
            self::TIMESTAMP => 'timestamp',
            self::ENUM => 'dropdown',
        };
    }

    public function getPossibleValues(SystemSettingKeyEnum $key)
    {
        return match ($this) {
            self::ENUM => $key->getValues(),
            default => [],
        };
    }
}
