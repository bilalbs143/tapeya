<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\QuickAccountInquiry\QuickAccountInquiryResource;
use App\Models\QuickAccountInquiry;

class QuickAccountInquiryController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(QuickAccountInquiry::class, QuickAccountInquiryResource::class, 'quick_account_inquiry');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function show(QuickAccountInquiry $quickAccountInquiry)
    {
        return $this->_show($quickAccountInquiry);
    }

    public function destroy(QuickAccountInquiry $quickAccountInquiry)
    {
        return $this->_destroy($quickAccountInquiry);
    }
}
