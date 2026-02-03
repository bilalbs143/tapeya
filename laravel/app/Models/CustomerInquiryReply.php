<?php

namespace App\Models;

class CustomerInquiryReply extends BaseModel
{
    protected $fillable = [
        'customer_inquiry_id',
        'content',
        'read_by',
        'read_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'restored_at' => 'datetime',
    ];
}
