<?php

namespace App\Http\Requests\Seamless\FourTen;

// This file is kept for compatibility but is no longer used in the seamless API
class CheckRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            ...$this->commonRules(),
        ];
    }
}
