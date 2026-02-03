<?php

namespace App\Utils\Traits\Model\Relationships;

use App\Models\User;

trait CommonRelationTrait
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
