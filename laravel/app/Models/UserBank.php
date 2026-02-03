<?php

namespace App\Models;

class UserBank extends BaseModel
{
    protected $fillable = [
        'user_id',
        'bank_id',
        'account_number',
        'account_holder',
    ];

    protected $touches = ['user'];

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }
}
