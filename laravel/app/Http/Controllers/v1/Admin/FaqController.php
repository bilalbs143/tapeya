<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Faq\FaqCategoryEnum;
use App\Http\Requests\v1\Admin\Faq\CreateFaqRequest;
use App\Http\Requests\v1\Admin\Faq\UpdateFaqRequest;
use App\Http\Resources\v1\Faq\FaqResource;
use App\Models\Faq;

class FaqController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Faq::class, FaqResource::class, 'faq');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function getCategories()
    {
        return response()->json([
            'data' => FaqCategoryEnum::withLabels(),
        ]);
    }

    public function store(CreateFaqRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateFaqRequest $request, Faq $faq)
    {
        return $this->_patch($request, $faq);
    }

    public function show(Faq $faq)
    {
        return $this->_show($faq);
    }

    public function destroy(Faq $faq)
    {
        return $this->_destroy($faq);
    }
}
