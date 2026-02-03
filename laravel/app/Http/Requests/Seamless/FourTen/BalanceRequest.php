<?php

namespace App\Http\Requests\Seamless\FourTen;

class BalanceRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'string'],
        ];
    }
}
