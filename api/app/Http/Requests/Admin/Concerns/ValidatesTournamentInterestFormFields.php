<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use Illuminate\Validation\Validator;

trait ValidatesTournamentInterestFormFields
{
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->has('form_fields')) {
                return;
            }

            $fields = $this->input('form_fields');
            if (! is_array($fields)) {
                return;
            }

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
        });
    }
}
