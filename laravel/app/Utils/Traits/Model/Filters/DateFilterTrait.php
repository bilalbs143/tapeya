<?php

namespace App\Utils\Traits\Model\Filters;

trait DateFilterTrait
{
    public function scopeDateFilter($query, $col, $date, $operator = '=')
    {
        return $query->whereDate($col, $operator, $date);
    }

    public function scopeCreatedAfter($query, $date)
    {
        return $query->dateFilter('created_at', $date, '>=');
    }

    public function scopeCreatedBefore($query, $date)
    {
        return $query->dateFilter('created_at', $date, '<=');
    }

    public function scopeCreatedBetween($query, $from, $to)
    {
        return $query->dateFilter('created_at', $from, '>=')->dateFilter('created_at', $to, '<=');
    }

    public function scopeUpdatedAfter($query, $date)
    {
        return $query->dateFilter('updated_at', $date, '>=');
    }

    public function scopeUpdatedBefore($query, $date)
    {
        return $query->dateFilter('updated_at', $date, '<=');
    }

    public function scopeUpdatedBetween($query, $from, $to)
    {
        return $query->dateFilter('updated_at', $from, '>=')->dateFilter('updated_at', $to, '<=');
    }

    public function scopeDeletedAfter($query, $date)
    {
        return $query->dateFilter('deleted_at', $date, '>=');
    }

    public function scopeDeletedBefore($query, $date)
    {
        return $query->dateFilter('deleted_at', $date, '<=');
    }

    public function scopeDeletedBetween($query, $from, $to)
    {
        return $query->dateFilter('deleted_at', $from, '>=')->dateFilter('deleted_at', $to, '<=');
    }

    public function scopeRestoredAfter($query, $date)
    {
        return $query->dateFilter('restored_at', $date, '>=');
    }

    public function scopeRestoredBefore($query, $date)
    {
        return $query->dateFilter('restored_at', $date, '<=');
    }

    public function scopeRestoredBetween($query, $from, $to)
    {
        return $query->dateFilter('restored_at', $from, '>=')->dateFilter('restored_at', $to, '<=');
    }

    public function scopeApprovedAfter($query, $date)
    {
        return $query->dateFilter('approved_at', $date, '>=');
    }

    public function scopeApprovedBefore($query, $date)
    {
        return $query->dateFilter('approved_at', $date, '<=');
    }

    public function scopeApprovedBetween($query, $from, $to)
    {
        return $query->dateFilter('approved_at', $from, '>=')->dateFilter('approved_at', $to, '<=');
    }

    public function scopeRejectedAfter($query, $date)
    {
        return $query->dateFilter('rejected_at', $date, '>=');
    }

    public function scopeRejectedBefore($query, $date)
    {
        return $query->dateFilter('rejected_at', $date, '<=');
    }

    public function scopeRejectedBetween($query, $from, $to)
    {
        return $query->dateFilter('rejected_at', $from, '>=')->dateFilter('rejected_at', $to, '<=');
    }

    public function scopeBlockedAfter($query, $date)
    {
        return $query->dateFilter('blocked_at', $date, '>=');
    }

    public function scopeBlockedBefore($query, $date)
    {
        return $query->dateFilter('blocked_at', $date, '<=');
    }

    public function scopeBlockedBetween($query, $from, $to)
    {
        return $query->dateFilter('blocked_at', $from, '>=')->dateFilter('blocked_at', $to, '<=');
    }

    public function scopeReadAfter($query, $date)
    {
        return $query->dateFilter('read_at', $date, '>=');
    }

    public function scopeReadBefore($query, $date)
    {
        return $query->dateFilter('read_at', $date, '<=');
    }

    public function scopeReadBetween($query, $from, $to)
    {
        return $query->dateFilter('read_at', $from, '>=')->dateFilter('read_at', $to, '<=');
    }

    public function scopeDateAfter($query, $date)
    {
        $query->dateFilter('date', $date, '>=');
    }

    public function scopeDateBefore($query, $date)
    {
        $query->dateFilter('date', $date, '<=');
    }

    public function scopeDateBetween($query, $from, $to)
    {
        $query->dateFilter('date', $from, '>=')->dateFilter('date', $to, '<=');
    }
}
