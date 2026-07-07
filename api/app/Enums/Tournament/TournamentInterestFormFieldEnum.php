<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentInterestFormFieldEnum: string
{
    use BaseEnumTrait;

    case PROFILE_PICTURE = 'profile_picture';
    case NAME = 'name';
    case NICKNAME = 'nickname';
    case PHONE = 'phone';
    case EMAIL = 'email';
    case DATE_OF_BIRTH = 'date_of_birth';
    case COUNTRY = 'country';
    case CITY = 'city';
    case ID_DOCUMENT = 'id_document';

    public function label(): string
    {
        return match ($this) {
            self::PROFILE_PICTURE => 'Profile Picture',
            self::NAME => 'Full Name',
            self::NICKNAME => 'Nickname',
            self::PHONE => 'Phone Number',
            self::EMAIL => 'Email',
            self::DATE_OF_BIRTH => 'Date of Birth',
            self::COUNTRY => 'Country',
            self::CITY => 'City',
            self::ID_DOCUMENT => 'CNIC / B-Form',
        };
    }

    /** Default v1 form — all fields enabled (matches legacy hardcoded form). */
    public static function defaults(): array
    {
        return self::values();
    }

    /** @return list<string> */
    public static function scalarValues(): array
    {
        return array_values(array_filter(
            self::values(),
            fn (string $value) => ! in_array($value, [self::PROFILE_PICTURE->value, self::ID_DOCUMENT->value], true),
        ));
    }

    public static function isFileField(string $value): bool
    {
        return in_array($value, [self::PROFILE_PICTURE->value, self::ID_DOCUMENT->value], true);
    }

    /** Stored on every submission regardless of campaign toggles (NOT NULL column; sourced from account). */
    public static function isAlwaysStored(string $value): bool
    {
        return $value === self::NAME->value;
    }

    /**
     * @param  list<string>  $enabled
     * @return array<string, mixed>
     */
    public static function submissionRules(array $enabled): array
    {
        $rules = [];

        foreach ($enabled as $field) {
            if (self::isAlwaysStored($field)) {
                continue;
            }

            $rules = array_merge($rules, match ($field) {
                self::NAME->value => ['name' => ['required', 'string', 'max:191']],
                self::NICKNAME->value => ['nickname' => ['required', 'string', 'max:191']],
                self::PHONE->value => ['phone' => ['required', 'string', 'max:30']],
                self::EMAIL->value => ['email' => ['required', 'email', 'max:191']],
                self::COUNTRY->value => ['country' => ['required', 'string', 'max:100']],
                self::CITY->value => ['city' => ['required', 'string', 'max:100']],
                self::DATE_OF_BIRTH->value => ['date_of_birth' => ['required', 'date', 'before:today']],
                default => [],
            });
        }

        return $rules;
    }
}
