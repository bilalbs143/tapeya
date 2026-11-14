<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Enums\Tournament\TournamentInterestCustomFieldTypeEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Models\TournamentInterestCampaign;
use App\Support\Interest\InterestCustomFields;
use Illuminate\Validation\Validator;

trait ValidatesTournamentInterestFormFields
{
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->has('form_fields')) {
                $fields = $this->input('form_fields');
                if (is_array($fields)) {
                    $fields = array_values(array_unique($fields));

                    if (! in_array(TournamentInterestFormFieldEnum::NAME->value, $fields, true)) {
                        $validator->errors()->add(
                            'form_fields',
                            'Full name is always stored on submissions and cannot be disabled.',
                        );
                    }

                    if (
                        in_array(TournamentInterestFormFieldEnum::CITY->value, $fields, true)
                        xor in_array(TournamentInterestFormFieldEnum::COUNTRY->value, $fields, true)
                    ) {
                        $validator->errors()->add(
                            'form_fields',
                            'Country and city must be enabled together.',
                        );
                    }
                }
            }

            if (! $this->has('custom_fields')) {
                return;
            }

            $raw = $this->input('custom_fields');
            if (! is_array($raw)) {
                return;
            }

            foreach ($raw as $index => $item) {
                if (! is_array($item)) {
                    continue;
                }

                $type = is_string($item['type'] ?? null) ? $item['type'] : null;
                if ($type === TournamentInterestCustomFieldTypeEnum::SELECT->value) {
                    $options = InterestCustomFields::normalizeOptions($item['options'] ?? []);
                    if ($options === []) {
                        $validator->errors()->add(
                            "custom_fields.{$index}.options",
                            'Dropdown fields need at least one option.',
                        );
                    }
                }
            }
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function normalizeCustomFieldsInData(array $data): array
    {
        if (! array_key_exists('custom_fields', $data)) {
            return $data;
        }

        $previous = null;
        $campaign = $this->route('campaign');
        if ($campaign instanceof TournamentInterestCampaign) {
            $previous = is_array($campaign->custom_fields) ? $campaign->custom_fields : null;
        }

        $data['custom_fields'] = InterestCustomFields::normalize($data['custom_fields'], $previous);

        return $data;
    }
}
