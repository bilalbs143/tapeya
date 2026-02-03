<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\CustomerInquiry\CustomerInquiryCategoryEnum;
use App\Enums\CustomerInquiry\CustomerInquiryStatusEnum;
use App\Events\User\CustomerInquiry\NewCustomerInquiry;
use App\Http\Requests\v1\User\CustomerInquiry\CreateCustomerInquiryRequest;
use App\Http\Resources\v1\CustomerInquiry\CustomerInquiryResource;
use App\Models\CustomerInquiry;

class CustomerInquiryController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(CustomerInquiry::class, CustomerInquiryResource::class, 'customer_inquiry');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
        ])->byMe();
    }

    public function getCategories()
    {
        return response()->json([
            'data' => CustomerInquiryCategoryEnum::withLabels(),
        ]);
    }

    public function store(CreateCustomerInquiryRequest $request)
    {
        if (CustomerInquiry::whereStatus(CustomerInquiryStatusEnum::PENDING)->whereBelongsTo(auth()->user(), 'creator')->exists()) {
            return $this->failure('customer_inquiry_already_pending', 400);
        }

        return $this->_store($request, 'customer_inquiry_submitted', fn ($record) => NewCustomerInquiry::dispatch($record));
    }

    public function show(CustomerInquiry $customerInquiry)
    {
        $customerInquiry->reply?->read();

        return $this->_show($customerInquiry);
    }

    public function destroy(CustomerInquiry $customerInquiry)
    {
        return $this->_destroy($customerInquiry);
    }
}
