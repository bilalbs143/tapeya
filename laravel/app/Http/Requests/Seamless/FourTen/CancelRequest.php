<?php

namespace App\Http\Requests\Seamless\FourTen;

// This file is kept for compatibility but is no longer used
// Cancel transactions are now handled via ResultRequest
class CancelRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            ...$this->getTransactionRules(),
        ];
    }
}
