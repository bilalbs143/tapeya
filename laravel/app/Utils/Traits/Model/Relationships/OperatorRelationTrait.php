<?php

namespace App\Utils\Traits\Model\Relationships;

use App\Models\User;

trait OperatorRelationTrait
{
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    public function deletor()
    {
        return $this->belongsTo(User::class, 'deleted_by', 'id');
    }

    public function restorer()
    {
        return $this->belongsTo(User::class, 'restored_by', 'id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    public function rejector()
    {
        return $this->belongsTo(User::class, 'rejected_by', 'id');
    }

    public function reader()
    {
        return $this->belongsTo(User::class, 'read_by', 'id');
    }
}
