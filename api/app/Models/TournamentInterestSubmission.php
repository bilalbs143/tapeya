<?php

namespace App\Models;

use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Support\Interest\InterestCustomFields;
use App\Support\Media\MediaDisk;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class TournamentInterestSubmission extends BaseModel
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'name',
        'nickname',
        'email',
        'phone',
        'country',
        'city',
        'custom_answers',
        'date_of_birth',
        'profile_picture_path',
        'id_document_path',
        'status',
        'withdrawn_at',
        'notes',
    ];

    protected $casts = [
        'status' => TournamentInterestSubmissionStatusEnum::class,
        'date_of_birth' => 'date',
        'withdrawn_at' => 'datetime',
        'custom_answers' => 'array',
    ];

    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('campaign_id'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::partial('name'),
            AllowedFilter::partial('nickname'),
            AllowedFilter::partial('email'),
            AllowedFilter::partial('phone'),
            AllowedFilter::callback('search', function (Builder $query, mixed $value): void {
                $query->search((string) $value);
            }),
        ];
    }

    /** Name / nickname / email / phone digit search used by list + CSV export. */
    public function scopeSearch(Builder $query, string $value): void
    {
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $digits = preg_replace('/\D/', '', $value) ?? '';
        $phoneLike = $digits !== '' ? '%'.$digits.'%' : null;

        $query->where(function (Builder $q) use ($term, $phoneLike): void {
            $q->whereRaw('LOWER(name) LIKE ?', [$term])
                ->orWhereRaw("LOWER(COALESCE(nickname, '')) LIKE ?", [$term])
                ->orWhereRaw("LOWER(COALESCE(email, '')) LIKE ?", [$term]);
            if ($phoneLike !== null) {
                $q->orWhereRaw("REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ?", [$phoneLike]);
            }
        });
    }

    public static function getSorts(): array
    {
        return ['id', 'name', 'status', 'created_at', 'updated_at'];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(TournamentInterestCampaign::class, 'campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    public function rawCustomAnswers(): array
    {
        $out = [];
        foreach (is_array($this->custom_answers) ? $this->custom_answers : [] as $key => $value) {
            if (! is_string($key) || (! is_string($value) && ! is_numeric($value))) {
                continue;
            }
            $trimmed = trim((string) $value);
            if ($trimmed !== '') {
                $out[$key] = $trimmed;
            }
        }

        return $out;
    }

    /**
     * Answers for API clients: file fields become public URLs.
     *
     * @return array<string, string|null>
     */
    public function resolvedCustomAnswersForApi(): array
    {
        $this->loadMissing('campaign');
        $fields = $this->campaign?->resolvedCustomFields() ?? [];
        $raw = $this->rawCustomAnswers();
        $out = [];

        foreach ($fields as $field) {
            $id = $field['id'];
            $value = $raw[$id] ?? null;
            $out[$id] = $value === null
                ? null
                : (($field['type'] ?? null) === 'file' ? MediaDisk::url($value) : $value);
        }

        return $out;
    }

    public function idDocumentUrlForApi(): ?string
    {
        if (is_string($this->id_document_path) && $this->id_document_path !== '') {
            return MediaDisk::url($this->id_document_path);
        }

        // Pre-migration rows may only have the path under custom_answers.
        $legacy = $this->rawCustomAnswers()[InterestCustomFields::DEFAULT_ID_DOCUMENT_ID] ?? null;

        return is_string($legacy) && $legacy !== '' ? MediaDisk::url($legacy) : null;
    }

    public function customAnswerPath(string $fieldId): ?string
    {
        return $this->rawCustomAnswers()[$fieldId] ?? null;
    }

    public function setCustomAnswerPath(string $fieldId, ?string $path): void
    {
        $answers = $this->rawCustomAnswers();
        if ($path === null || $path === '') {
            unset($answers[$fieldId]);
        } else {
            $answers[$fieldId] = $path;
        }

        $payload = ['custom_answers' => $answers === [] ? null : $answers];
        // Rare: legacy custom file field id still `id_document` — keep the dedicated column in sync.
        if ($fieldId === InterestCustomFields::DEFAULT_ID_DOCUMENT_ID) {
            $payload['id_document_path'] = $path;
        }

        $this->forceFill($payload)->save();
    }
}
