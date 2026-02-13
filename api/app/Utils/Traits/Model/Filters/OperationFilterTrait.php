<?php

namespace App\Utils\Traits\Model\Filters;

trait OperationFilterTrait
{
    public function scopeApproved($query)
    {
        $query->whereNotNull('approved_at');
    }

    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    public function scopeNotApproved($query)
    {
        $query->whereNull('approved_at');
    }

    public function scopeRejected($query)
    {
        $query->whereNotNull('rejected_at');
    }

    public function isRejected(): bool
    {
        return $this->rejected_at !== null;
    }

    public function scopeNotRejected($query)
    {
        $query->whereNull('rejected_at');
    }
}
