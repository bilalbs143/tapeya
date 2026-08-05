<?php

namespace App\Services\User;

use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Nnjeim\World\Models\City;

/**
 * Bulk-create app users (`type = user`) for the admin player registry / CSV import.
 *
 * Header (required columns, any order):
 * name,nickname,phone,email,date_of_birth,playing_role,bowling_style,batting_style,country,city
 */
class PlayerCsvImportService
{
    private const MAX_ROWS = 500;

    /** @var list<string> */
    private const HEADER_KEYS = [
        'name',
        'nickname',
        'phone',
        'email',
        'date_of_birth',
        'playing_role',
        'bowling_style',
        'batting_style',
        'country',
        'city',
    ];

    /**
     * @return array{rows_imported: int, rows_skipped: int, errors: array<int, string>, dry_run?: bool}
     */
    public function import(UploadedFile $file, bool $dryRun, User $actor): array
    {
        $errors = [];
        $imported = 0;
        $skipped = 0;

        $realPath = $file->getRealPath();
        if ($realPath === false) {
            return $this->result(0, 0, ['Could not read file.'], $dryRun);
        }

        $handle = fopen($realPath, 'r');
        if ($handle === false) {
            return $this->result(0, 0, ['Could not read file.'], $dryRun);
        }

        $pkCityNamesLower = $this->pakistanCityNamesLower();

        try {
            $header = fgetcsv($handle);
            if ($header === false) {
                return $this->result(0, 0, ['Empty file.'], $dryRun);
            }

            $header = array_map(fn ($h) => strtolower(trim((string) $h)), $header);
            $indexes = [];
            foreach (self::HEADER_KEYS as $key) {
                $i = array_search($key, $header, true);
                if ($i === false) {
                    return $this->result(0, 0, [
                        'CSV header must include all columns: '.implode(',', self::HEADER_KEYS),
                    ], $dryRun);
                }
                $indexes[$key] = $i;
            }

            $rowNum = 1;
            $nicknamesInFile = [];

            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if ($rowNum > self::MAX_ROWS + 1) {
                    $errors[] = 'Row limit exceeded ('.self::MAX_ROWS.').';

                    break;
                }
                if (count(array_filter($row, fn ($c) => trim((string) $c) !== '')) === 0) {
                    continue;
                }

                $data = [];
                foreach ($indexes as $key => $idx) {
                    $data[$key] = isset($row[$idx]) ? trim((string) $row[$idx]) : '';
                }

                if ($data['name'] === '' && $data['nickname'] === '' && $data['phone'] === '') {
                    continue;
                }

                $lineErrors = $this->validateRow($data, $nicknamesInFile, $pkCityNamesLower);
                if ($lineErrors !== []) {
                    $skipped++;
                    foreach ($lineErrors as $msg) {
                        $errors[] = "Line {$rowNum}: {$msg}";
                    }

                    continue;
                }

                $nicknamesInFile[strtolower($data['nickname'])] = true;

                if ($dryRun) {
                    $imported++;

                    continue;
                }

                try {
                    $createdBy = $actor->id;
                    DB::transaction(function () use ($data, $createdBy): void {
                        $email = $data['email'] !== '' ? $data['email'] : null;
                        User::query()->create([
                            'name' => $data['name'],
                            'nickname' => $data['nickname'],
                            'email' => $email,
                            'phone' => $data['phone'],
                            'date_of_birth' => $data['date_of_birth'],
                            'type' => UserTypeEnum::USER,
                            'status' => UserStatusEnum::ACTIVE,
                            'playing_role' => $data['playing_role'] !== null ? PlayingRoleEnum::from($data['playing_role']) : null,
                            'bowling_style' => $data['bowling_style'] !== null ? BowlingStyleEnum::from($data['bowling_style']) : null,
                            'batting_style' => $data['batting_style'] !== null ? BattingStyleEnum::from($data['batting_style']) : null,
                            'country' => $data['country'],
                            'city' => $data['city'],
                            'created_by' => $createdBy,
                        ]);
                    });
                    $imported++;
                } catch (\Throwable $e) {
                    $skipped++;
                    $errors[] = "Line {$rowNum}: ".$e->getMessage();
                }
            }
        } finally {
            if (is_resource($handle)) {
                fclose($handle);
            }
        }

        return $this->result($imported, $skipped, array_slice($errors, 0, 100), $dryRun);
    }

    /**
     * @return list<string>
     */
    private function validateRow(array &$data, array &$nicknamesInFile, array $pkCityNamesLower): array
    {
        $data['email'] = $data['email'] !== '' ? $data['email'] : null;
        $data['date_of_birth'] = $data['date_of_birth'] !== '' ? $data['date_of_birth'] : null;
        $data['playing_role'] = $data['playing_role'] !== '' ? $data['playing_role'] : null;
        $data['bowling_style'] = $data['bowling_style'] !== '' ? $data['bowling_style'] : null;
        $data['batting_style'] = $data['batting_style'] !== '' ? $data['batting_style'] : null;
        $data['country'] = trim((string) $data['country']) !== '' ? trim($data['country']) : null;
        $data['city'] = trim((string) $data['city']) !== '' ? trim($data['city']) : null;

        if (isset($nicknamesInFile[strtolower($data['nickname'])])) {
            return ['duplicate nickname in file'];
        }

        if ($data['country'] !== null && strcasecmp($data['country'], 'Pakistan') !== 0) {
            return ['when country is set it must be Pakistan (only supported country for this import)'];
        }

        if (
            $data['country'] !== null
            && strcasecmp($data['country'], 'Pakistan') === 0
            && $data['city'] !== null
            && $pkCityNamesLower !== []
        ) {
            $cityLower = Str::lower($data['city']);
            if (! in_array($cityLower, $pkCityNamesLower, true)) {
                return ['city must match a Pakistan city from the world dataset (see backoffice import guide)'];
            }
        }

        $v = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'nickname' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/', 'unique:users,nickname'],
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,}$/', 'unique:users,phone'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'playing_role' => ['nullable', Rule::enum(PlayingRoleEnum::class)],
            'bowling_style' => ['nullable', Rule::enum(BowlingStyleEnum::class)],
            'batting_style' => ['nullable', Rule::enum(BattingStyleEnum::class)],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
        ]);

        if ($v->fails()) {
            return $v->errors()->all();
        }

        return [];
    }

    /**
     * @return list<string> lowercased city names for PK, or empty if world table has no PK cities (tests / partial seed).
     */
    private function pakistanCityNamesLower(): array
    {
        try {
            $names = City::query()
                ->where('country_code', 'PK')
                ->pluck('name')
                ->map(fn ($n) => Str::lower(trim((string) $n)))
                ->unique()
                ->values()
                ->all();

            return $names;
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @param  array<int, string>  $errors
     * @return array{rows_imported: int, rows_skipped: int, errors: array<int, string>, dry_run?: bool}
     */
    private function result(int $imported, int $skipped, array $errors, bool $dryRun): array
    {
        $out = [
            'rows_imported' => $imported,
            'rows_skipped' => $skipped,
            'errors' => $errors,
        ];
        if ($dryRun) {
            $out['dry_run'] = true;
        }

        return $out;
    }
}
