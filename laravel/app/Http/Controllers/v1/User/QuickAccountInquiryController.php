<?php

namespace App\Http\Controllers\v1\User;

use App\Events\User\QuickAccountInquiry\NewQuickAccountInquiry;
use App\Http\Requests\v1\User\QuickAccountInquiry\CreateQuickAccountInquiryRequest;
use App\Http\Resources\v1\QuickAccountInquiry\QuickAccountInquiryResource;
use App\Models\QuickAccountInquiry;

class QuickAccountInquiryController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(QuickAccountInquiry::class, QuickAccountInquiryResource::class, 'quick_inquiry');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
        ])->byMe();
    }

    public function store(CreateQuickAccountInquiryRequest $request)
    {
        return $this->_store($request, 'quick_inquiry_submitted', fn ($record) => NewQuickAccountInquiry::dispatch($record));
    }
}
