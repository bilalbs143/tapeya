<?php

use App\Support\Interest\InterestCustomFields;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Final interest schema:
 * - campaigns.custom_fields (dynamic questions; trial venue lives here)
 * - submissions.custom_answers + notes
 * - CNIC stays on form_fields / id_document_path (not custom_fields)
 *
 * Also backfills older rows that stored trial_venue in form_fields (or legacy columns).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournament_interest_campaigns', function (Blueprint $table) {
            if (! Schema::hasColumn('tournament_interest_campaigns', 'custom_fields')) {
                $table->json('custom_fields')->nullable()->after('form_fields');
            }
        });

        Schema::table('tournament_interest_submissions', function (Blueprint $table) {
            if (! Schema::hasColumn('tournament_interest_submissions', 'custom_answers')) {
                $table->json('custom_answers')->nullable()->after('city');
            }
            if (! Schema::hasColumn('tournament_interest_submissions', 'notes')) {
                $table->text('notes')->nullable()->after('withdrawn_at');
            }
        });

        $this->backfillCampaigns();
        $this->backfillSubmissions();

        Schema::table('tournament_interest_campaigns', function (Blueprint $table) {
            if (Schema::hasColumn('tournament_interest_campaigns', 'trial_venue_options')) {
                $table->dropColumn('trial_venue_options');
            }
        });

        Schema::table('tournament_interest_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('tournament_interest_submissions', 'trial_venue')) {
                $table->dropColumn('trial_venue');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tournament_interest_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('tournament_interest_submissions', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('tournament_interest_submissions', 'custom_answers')) {
                $table->dropColumn('custom_answers');
            }
        });

        Schema::table('tournament_interest_campaigns', function (Blueprint $table) {
            if (Schema::hasColumn('tournament_interest_campaigns', 'custom_fields')) {
                $table->dropColumn('custom_fields');
            }
        });
    }

    private function backfillCampaigns(): void
    {
        $hasVenueOptions = Schema::hasColumn('tournament_interest_campaigns', 'trial_venue_options');

        $rows = DB::table('tournament_interest_campaigns')->select([
            'id',
            'form_fields',
            'custom_fields',
            ...($hasVenueOptions ? ['trial_venue_options'] : []),
        ])->get();

        foreach ($rows as $row) {
            $formFields = $this->decodeList($row->form_fields);
            $custom = InterestCustomFields::normalize($this->decodeList($row->custom_fields) ?? []);
            $ids = array_column($custom, 'id');

            // Strip any accidental CNIC custom-field rows — CNIC is form_fields.id_document.
            $custom = array_values(array_filter(
                $custom,
                fn (array $field) => ($field['id'] ?? null) !== InterestCustomFields::DEFAULT_ID_DOCUMENT_ID
                    && strcasecmp((string) ($field['label'] ?? ''), 'CNIC / B-Form') !== 0,
            ));
            $ids = array_column($custom, 'id');

            $hadTrialVenue = is_array($formFields) && in_array('trial_venue', $formFields, true);
            if ($hadTrialVenue && ! in_array('trial_venue', $ids, true)) {
                $options = $hasVenueOptions
                    ? InterestCustomFields::normalizeOptions($this->decodeList($row->trial_venue_options ?? null))
                    : [];
                $custom[] = [
                    'id' => 'trial_venue',
                    'type' => 'select',
                    'label' => 'Trial Venue',
                    'required' => true,
                    'options' => $options,
                ];
            }

            $nextForm = $formFields;
            if (is_array($formFields) && $formFields !== []) {
                $nextForm = array_values(array_filter(
                    $formFields,
                    fn ($f) => is_string($f) && $f !== 'trial_venue',
                ));
                // Keep id_document when it was already enabled; null form_fields → enum defaults include it.
                if (
                    in_array('id_document', $formFields, true)
                    && ! in_array('id_document', $nextForm, true)
                ) {
                    $nextForm[] = 'id_document';
                }
            }

            DB::table('tournament_interest_campaigns')->where('id', $row->id)->update([
                'custom_fields' => json_encode(array_values($custom)),
                'form_fields' => $nextForm === null ? null : json_encode($nextForm),
            ]);
        }
    }

    private function backfillSubmissions(): void
    {
        $hasTrialVenue = Schema::hasColumn('tournament_interest_submissions', 'trial_venue');
        $select = ['id', 'custom_answers'];
        if ($hasTrialVenue) {
            $select[] = 'trial_venue';
        }

        $rows = DB::table('tournament_interest_submissions')->select($select)->get();

        foreach ($rows as $row) {
            $answers = $this->decodeObject($row->custom_answers);
            // CNIC lives on id_document_path — drop legacy mirrored answer keys.
            unset($answers[InterestCustomFields::DEFAULT_ID_DOCUMENT_ID]);

            if ($hasTrialVenue && is_string($row->trial_venue ?? null) && trim((string) $row->trial_venue) !== '') {
                $answers['trial_venue'] = trim((string) $row->trial_venue);
            }

            DB::table('tournament_interest_submissions')->where('id', $row->id)->update([
                'custom_answers' => $answers === [] ? null : json_encode($answers),
            ]);
        }
    }

    /**
     * @return list<mixed>|null
     */
    private function decodeList(mixed $raw): ?array
    {
        if ($raw === null || $raw === '') {
            return null;
        }
        if (is_array($raw)) {
            return array_values($raw);
        }
        if (! is_string($raw)) {
            return null;
        }
        $decoded = json_decode($raw, true);

        return is_array($decoded) ? array_values($decoded) : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeObject(mixed $raw): array
    {
        $decoded = $this->decodeList($raw);

        return is_array($decoded) ? $decoded : [];
    }
};
