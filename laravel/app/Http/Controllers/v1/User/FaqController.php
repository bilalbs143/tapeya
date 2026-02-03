<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Faq\FaqResource;
use App\Models\Faq;

class FaqController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Faq::class, FaqResource::class, 'faq');
    }

    protected function baseQuery()
    {
        return $this->model->active();
    }
}
