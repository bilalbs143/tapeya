<?php

namespace App\Models;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Support\Interest\InterestCustomFields;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class TournamentInterestCampaign extends BaseModel
{
    protected $fillable = [
        'tournament_id',
        'tournament_name',
        'slug',
        'description',
        'form_fields',
        'custom_fields',
        'logo_path',
        'show_in_sidebar',
        'show_dialog',
        'status',
        'created_by',
    ];

    protected $casts = [
        'show_in_sidebar' => 'boolean',
        'show_dialog' => 'boolean',
        'form_fields' => 'array',
        'custom_fields' => 'array',
        'status' => TournamentInterestCampaignStatusEnum::class,
    ];

    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('tournament_id'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('slug'),
            AllowedFilter::partial('tournament_name'),
            AllowedFilter::callback('linked', function ($query, $value) {
                $linked = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                $linked
                    ? $query->whereNotNull('tournament_id')
                    : $query->whereNull('tournament_id');
            }),
        ];
    }

    public static function getSorts(): array
    {
        return ['id', 'tournament_name', 'status', 'created_at', 'updated_at'];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TournamentInterestSubmission::class, 'campaign_id');
    }

    /**
     * Enabled user/account form fields. Null/empty stored value means legacy default (all user fields).
     *
     * @return list<string>
     */
    public function resolvedFormFields(): array
    {
        $stored = $this->form_fields;
        if ($stored === null || $stored === []) {
            return TournamentInterestFormFieldEnum::defaults();
        }

        $allowed = TournamentInterestFormFieldEnum::values();

        $fields = array_values(array_unique(array_filter(
            $stored,
            fn (mixed $field) => is_string($field) && in_array($field, $allowed, true),
        )));

        if (! in_array(TournamentInterestFormFieldEnum::NAME->value, $fields, true)) {
            array_unshift($fields, TournamentInterestFormFieldEnum::NAME->value);
        }

        return $fields;
    }

    public function formFieldEnabled(string $field): bool
    {
        return in_array($field, $this->resolvedFormFields(), true);
    }

    /**
     * Campaign-defined questions (text / select / file).
     *
     * @return list<array{id: string, type: string, label: string, required: bool, options?: list<string>}>
     */
    public function resolvedCustomFields(): array
    {
        return InterestCustomFields::resolve($this->custom_fields);
    }

    public function customFileFieldEnabled(string $fieldId): bool
    {
        $field = InterestCustomFields::find($this->resolvedCustomFields(), $fieldId);

        return $field !== null && ($field['type'] ?? null) === 'file';
    }
}
