<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | 다음 언어 라인에는 validator 클래스에서 사용하는 기본 오류 메시지가 포함되어 있습니다.
    | 이러한 규칙 중 일부는 크기 규칙과 같이 여러 버전이 있습니다.
    | 각각의 메시지를 여기에서 조정할 수 있습니다.
    |
    */

    'accepted' => ':attribute fields must agree.',
    'accepted_if' => ' When :other is :value , :attribute field must agree.',
    'active_url' => ' :attribute field must be a valid URL.',
    'after' => ' :attribute field is :date It must be a later date.',
    'after_or_equal' => ' :attribute field is :date Must be later or on the same date.',
    'alpha' => ' :attribute field must contain only letters.',
    'alpha_dash' => ' :attribute fields must contain only letters, numbers, dashes, and underscores.',
    'alpha_num' => ' :attribute field must contain only letters and numbers.',
    'array' => ' :attribute field must be an array.',
    'ascii' => ' :attribute fields must contain only single-byte alphanumeric characters and symbols.',
    'before' => ' :attribute field closes :date It must be an older date.',
    'before_or_equal' => ' :attribute field is :date It must be on the same or previous date.',
    'between' => [
        'array' => ' :attribute field must contain entries from :min to :max .',
        'file' => ' :attribute field must be between 16 :min :max kilobytes.',
        'numeric' => ' :attribute field must be between :min and :max .',
        'string' => ' :attribute field must be between :min and :max characters.',
    ],
    'boolean' => ' :attribute field must be true or false.',
    'can' => ' :attribute field contains an unauthorized value.',
    'confirmed' => ' :attribute field validation does not match.',
    'current_password' => ' Your password is incorrect.',
    'date' => ' :attribute field must be a valid date.',
    'date_equals' => ' :attribute field is :date It must be the same date as .',
    'date_format' => ' :attribute field must match :format format.',
    'decimal' => ' :attribute fields must have :decimal decimal digits.',
    'declined' => ' :attribute field must be rejected.',
    'declined_if' => ' When :other :value , :attribute fields must be rejected.',
    'different' => ' :attribute field and :other must be different.',
    'digits' => ' :attribute field must be :digits digits.',
    'digits_between' => ' :attribute field must be between :min and :max digits long.',
    'dimensions' => ' The image dimension in :attribute field is incorrect.',
    'distinct' => ' :attribute field has duplicate values.',
    'doesnt_end_with' => ' :attribute field must not end with one of the following: :values .',
    'doesnt_start_with' => ' :attribute field must not begin with one of the following: :values .',
    'email' => ' :attribute field must be a valid email address.',
    'ends_with' => ' :attribute field must end with one of the following: :values .',
    'enum' => ' The selected :attribute is invalid.',
    'exists' => ' The selected :attribute is invalid.',
    'extensions' => ' :attribute field must have one of the following extensions: :values .',
    'file' => ' :attribute field must be a file.',
    'filled' => ' :attribute field must have a value.',
    'gt' => [
        'array' => ' :attribute field must have more entries than :value .',
        'file' => ' :attribute field must be larger than :value kilobytes.',
        'numeric' => ' :attribute field must be larger than :value .',
        'string' => ' The :attribute field must be larger than :value characters.',
    ],
    'gte' => [
        'array' => ' :attribute field must have a :value item or more.',
        'file' => ' :attribute field must be at least an :value kilobyte.',
        'numeric' => ':attribute field must be :value or higher.',
        'string' => ' :attribute field must be at least :value characters.',
    ],
    'hex_color' => ' :attribute field must be a valid hexadecimal color.',
    'image' => ' :attribute field must be an image.',
    'in' => ' :attribute selection is invalid.',
    'in_array' => ' :attribute fields must exist in :other .',
    'integer' => ' :attribute field must be an integer.',
    'ip' => ' :attribute field must be a valid IP address.',
    'ipv4' => ' :attribute field must be a valid IPv4 address.',
    'ipv6' => ' :attribute field must be a valid IPv6 address.',
    'json' => ' :attribute field must be a valid JSON string.',
    'lowercase' => ' :attribute fields must be lowercase.',
    'lt' => [
        'array' => ' :attribute field must have fewer entries than :value .',
        'file' => ' :attribute field must be less than :value kilobytes.',
        'numeric' => ' :attribute field must be less than :value .',
        'string' => ' :attribute field must be smaller than :value characters.',
    ],
    'lte' => [
        'array' => ' :attribute field must have :value entry or less.',
        'file' => ' :attribute field must be less than :value kilobytes.',
        'numeric' => ' :attribute field must be :value or lower.',
        'string' => ' :attribute fields must be :value characters or less.',
    ],
    'mac_address' => ' :attribute field must be a valid MAC address.',
    'max' => [
        'array' => ' :attribute field must not have more than :max entries.',
        'file' => ' :attribute fields must not exceed :max kilobytes.',
        'numeric' => ' :attribute field must not exceed :max .',
        'string' => ' :attribute field must not exceed :max characters.',
    ],
    'max_digits' => ' :attribute field must not exceed :max digits.',
    'mimes' => ' :attribute field must be a file of the following type: :values .',
    'mimetypes' => ' :attribute field must be a file of the following type: :values .',
    'min' => [
        'array' => ' :attribute fields must have at least a :min entry.',
        'file' => ' :attribute field must be at least :min kilobytes.',
        'numeric' => ' :attribute field must have at least :min .',
        'string' => ' :attribute field must contain at least :min characters.',
    ],
    'min_digits' => ' :attribute field must have at least :min digits.',
    'missing' => ' :attribute field should be missing.',
    'missing_if' => ' When :other is :value , :attribute field should be missing.',
    'missing_unless' => ' :attribute field should be missing, except when :other is :value .',
    'missing_with' => ' When :values exists, :attribute field should be missing.',
    'missing_with_all' => ' When :values is present, :attribute field should be missing.',
    'multiple_of' => ' :attribute field must be a multiple of :value .',
    'not_in' => ' The selected :attribute is invalid.',
    'not_regex' => ' :attribute field format is invalid.',
    'numeric' => ' :attribute field must be numeric.',
    'password' => [
        'letters' => ' :attribute field must contain at least one character.',
        'mixed' => ' :attribute field must contain at least one uppercase letter and one lowercase letter.',
        'numbers' => ' :attribute field must contain at least one number.',
        'symbols' => ' :attribute field must contain at least one symbol.',
        'uncompromised' => ' The provided :attribute appeared in a data breach. Please select another :attribute .',
    ],
    'present' => ' :attribute fields must exist.',
    'present_if' => 'The :attribute field is required when :other is :value.',
    'present_unless' => 'The :attribute field is required unless :other is :value.',
    'present_with' => 'The :attribute field is required when :values is present.',
    'present_with_all' => 'The :attribute field is required when :values are present.',
    'prohibited' => 'The :attribute field is prohibited.',
    'prohibited_if' => 'The :attribute field is prohibited when :other is :value.',
    'prohibited_unless' => 'The :attribute field is prohibited unless :other is in :values.',
    'prohibits' => 'The :attribute field prohibits the existence of :other.',
    'regex' => 'The :attribute field format is invalid.',
    'required' => 'The :attribute field is required.',
    'required_array_keys' => 'The :attribute field must have items for the following keys: :values.',
    'required_if' => 'The :attribute field is required when :other is :value.',
    'required_if_accepted' => 'The :attribute field is required when :other is accepted.',
    'required_unless' => 'The :attribute field is required unless :other is in :values.',
    'required_with' => 'The :attribute field is required when :values is present.',
    'required_with_all' => 'The :attribute field is required when :values are present.',
    'required_without' => 'The :attribute field is required when :values is not present.',
    'required_without_all' => 'The :attribute field is required when none of :values are present.',
    'same' => 'The :attribute field must match :other.',
    'size' => [
        'array' => 'The :attribute field must contain :size items.',
        'file' => 'The :attribute field must be :size kilobytes.',
        'numeric' => 'The :attribute field must be :size.',
        'string' => 'The :attribute field must be :size characters.',
    ],
    'starts_with' => 'The :attribute field must start with one of the following: :values.',
    'string' => 'The :attribute field must be a string.',
    'timezone' => 'The :attribute field must be a valid timezone.',
    'unique' => 'The :attribute has already been taken.',
    'uploaded' => 'The :attribute failed to upload.',
    'uppercase' => 'The :attribute field must be uppercase.',
    'url' => 'The :attribute field must be a valid URL.',
    'ulid' => 'The :attribute field must be a valid ULID.',
    'uuid' => 'The :attribute field must be a valid UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
