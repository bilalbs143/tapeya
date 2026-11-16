<?php

namespace App\Services\Interest;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentInterestSubmission;
use App\Support\Interest\InterestCustomFields;
use App\Support\Media\MediaDisk;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Excel-friendly CSV export for interest campaign submissions.
 *
 * UTF-8 BOM + fputcsv quoting so Excel / Sheets open the file cleanly.
 */
final class InterestSubmissionCsvExporter
{
    /**
     * @param  array{status?: string|null, search?: string|null}  $filters
     */
    public function stream(TournamentInterestCampaign $campaign, array $filters = []): StreamedResponse
    {
        $columns = $this->columns(
            $campaign->resolvedFormFields(),
            $campaign->resolvedCustomFields(),
        );
        $headers = array_merge(['Serial No.'], array_column($columns, 'header'));
        $filename = (Str::slug((string) $campaign->slug) ?: 'campaign').'-submissions-'.now()->format('Y-m-d').'.csv';
        $query = $this->query($campaign, $filters);

        return response()->streamDownload(function () use ($query, $headers, $columns): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }

            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);

            $serial = 0;
            $query->orderBy('id')->chunkById(200, function (Collection $rows) use ($out, $columns, &$serial): void {
                foreach ($rows as $submission) {
                    /** @var TournamentInterestSubmission $submission */
                    $serial++;
                    $answers = $submission->rawCustomAnswers();
                    $row = [(string) $serial];
                    foreach ($columns as $column) {
                        $row[] = ($column['value'])($submission, $answers);
                    }
                    fputcsv($out, $row);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * @param  array{status?: string|null, search?: string|null}  $filters
     * @return Builder<TournamentInterestSubmission>
     */
    private function query(TournamentInterestCampaign $campaign, array $filters): Builder
    {
        $query = TournamentInterestSubmission::query()->where('campaign_id', $campaign->id);

        $status = trim((string) ($filters['status'] ?? ''));
        if ($status !== '') {
            $query->where('status', $status);
        }

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $query->search($search);
        }

        return $query;
    }

    /**
     * Single source of truth for header + cell value (avoids column drift).
     *
     * @param  list<string>  $formFields
     * @param  list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>  $customFields
     * @return list<array{header: string, value: callable(TournamentInterestSubmission, array<string, string>): string}>
     */
    private function columns(array $formFields, array $customFields): array
    {
        $columns = [
            [
                'header' => 'Name',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->name),
            ],
        ];

        $scalars = [
            TournamentInterestFormFieldEnum::NICKNAME->value => [
                'header' => 'Nickname',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->nickname),
            ],
            TournamentInterestFormFieldEnum::EMAIL->value => [
                'header' => 'Email',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->email),
            ],
            TournamentInterestFormFieldEnum::PHONE->value => [
                'header' => 'Phone',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->phone),
            ],
            TournamentInterestFormFieldEnum::COUNTRY->value => [
                'header' => 'Country',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->country),
            ],
            TournamentInterestFormFieldEnum::CITY->value => [
                'header' => 'City',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->city),
            ],
            TournamentInterestFormFieldEnum::DATE_OF_BIRTH->value => [
                'header' => 'Date of Birth',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->date_of_birth?->format('Y-m-d')),
            ],
        ];

        foreach ($scalars as $key => $column) {
            if (! in_array($key, $formFields, true)) {
                continue;
            }
            $columns[] = $column;
            if ($key === TournamentInterestFormFieldEnum::DATE_OF_BIRTH->value) {
                $columns[] = [
                    'header' => 'Age',
                    'value' => function (TournamentInterestSubmission $s, array $_): string {
                        $dob = $s->date_of_birth;

                        return $dob instanceof CarbonInterface ? (string) $dob->age : '';
                    },
                ];
            }
        }

        // text / select → answer value; file → public download URL (clickable link in Excel).
        // Skip id_document — emitted as a fixed form_fields column below.
        foreach ($customFields as $field) {
            $id = $field['id'];
            if ($id === InterestCustomFields::DEFAULT_ID_DOCUMENT_ID) {
                continue;
            }
            $isFile = ($field['type'] ?? null) === 'file';
            $columns[] = [
                'header' => $isFile ? $field['label'].' Link' : $field['label'],
                'value' => function (TournamentInterestSubmission $_, array $answers) use ($id, $isFile): string {
                    $raw = $answers[$id] ?? null;
                    if (! is_string($raw) && ! is_numeric($raw)) {
                        return '';
                    }
                    $raw = trim((string) $raw);
                    if ($raw === '') {
                        return '';
                    }
                    if ($isFile) {
                        return $this->cell($this->fileLink($raw));
                    }

                    return $this->cell($raw);
                },
            ];
        }

        if (in_array(TournamentInterestFormFieldEnum::PROFILE_PICTURE->value, $formFields, true)) {
            $columns[] = [
                'header' => 'Profile Picture Link',
                'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell(
                    $this->fileLink($s->profile_picture_path)
                ),
            ];
        }

        if (in_array(TournamentInterestFormFieldEnum::ID_DOCUMENT->value, $formFields, true)) {
            $columns[] = [
                'header' => 'CNIC / B-Form Link',
                'value' => function (TournamentInterestSubmission $s, array $answers): string {
                    $path = (is_string($s->id_document_path) && $s->id_document_path !== '')
                        ? $s->id_document_path
                        : ($answers[InterestCustomFields::DEFAULT_ID_DOCUMENT_ID] ?? null);

                    return $this->cell($this->fileLink(is_string($path) ? $path : null));
                },
            ];
        }

        $columns[] = [
            'header' => 'Status',
            'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->status?->label() ?? $s->status?->value),
        ];
        $columns[] = [
            'header' => 'Notes',
            'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->notes),
        ];
        $columns[] = [
            'header' => 'Submitted At',
            'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->created_at?->format('Y-m-d H:i:s')),
        ];
        $columns[] = [
            'header' => 'Withdrawn At',
            'value' => fn (TournamentInterestSubmission $s, array $_): string => $this->cell($s->withdrawn_at?->format('Y-m-d H:i:s')),
        ];

        return $columns;
    }

    /** Storage path or absolute URL → public link for the CSV. */
    private function fileLink(?string $pathOrUrl): ?string
    {
        if ($pathOrUrl === null || trim($pathOrUrl) === '') {
            return null;
        }

        $value = trim($pathOrUrl);
        if (preg_match('#^https?://#i', $value) === 1) {
            return $value;
        }

        return MediaDisk::url($value);
    }

    private function cell(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $text = trim((string) $value);
        if ($text === '') {
            return '';
        }

        // Mitigate CSV formula injection when opened in Excel.
        // Do not prefix phones (`+92…`) — the leading `'` shows up as a visible character.
        if (preg_match('/^[=@\-]/', $text) === 1) {
            return "'".$text;
        }

        return $text;
    }
}
