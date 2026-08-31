<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\UpdateSupportMessageRequest;
use App\Http\Resources\Admin\SupportMessageResource;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;

class SupportMessageController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(SupportMessage::class, SupportMessageResource::class, 'support message');
    }

    protected function baseQuery()
    {
        return SupportMessage::query()->with('user:id,name,nickname');
    }

    public function show(SupportMessage $supportMessage): JsonResponse
    {
        return $this->_show($supportMessage);
    }

    public function update(UpdateSupportMessageRequest $request, SupportMessage $supportMessage): JsonResponse
    {
        return $this->_patch($request, $supportMessage, 'Support message updated.');
    }
}
