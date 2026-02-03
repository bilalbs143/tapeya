<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\CustomerInquiry\ReplyToCustomerInquiryRequest;
use App\Http\Resources\v1\CustomerInquiry\CustomerInquiryResource;
use App\Models\CustomerInquiry;

class CustomerInquiryController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(CustomerInquiry::class, CustomerInquiryResource::class, 'customer_inquiry');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
        ]);
    }

    public function reply(ReplyToCustomerInquiryRequest $request, CustomerInquiry $customerInquiry)
    {
        $data = $request->validated();
        $customerInquiry->sendReply($data['content']);

        $customerInquiry = $this->refresh($customerInquiry);

        return $this->success(new $this->resource($customerInquiry), 'customer_inquiry_replied');
    }

    public function show(CustomerInquiry $customerInquiry)
    {
        $customerInquiry->read();

        return $this->_show($customerInquiry);
    }

    public function destroy(CustomerInquiry $customerInquiry)
    {
        return $this->_destroy($customerInquiry);
    }
}
