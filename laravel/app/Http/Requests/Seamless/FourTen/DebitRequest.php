<?php

namespace App\Http\Requests\Seamless\FourTen;

class DebitRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            ...$this->getTransactionRules(),
        ];
    }
}
