<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Promotion\CreatePromotionRequest;
use App\Http\Requests\v1\Admin\Promotion\UpdatePromotionRequest;
use App\Http\Resources\v1\Promotion\PromotionResource;
use App\Models\Promotion;
use App\Promotions\Support\PromotionTypeSchema;

class PromotionController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Promotion::class, PromotionResource::class, 'promotion');
    }

    protected function baseQuery()
    {
        return $this->model->newQuery();
    }

    public function store(CreatePromotionRequest $request)
    {
        return $this->_store($request, null, null, function (&$data) {
            // If config arrives as JSON string in multipart, decode.
            if (isset($data['config']) && is_string($data['config'])) {
                $decoded = json_decode($data['config'], true);
                if (is_array($decoded)) {
                    $data['config'] = $decoded;
                }
            }
        });
    }

    public function getTypes()
    {
        return response()->success(PromotionTypeSchema::all());
    }

    public function patch(UpdatePromotionRequest $request, Promotion $promotion)
    {
        return $this->_patch($request, $promotion, null, null, function (&$data) {
            if (isset($data['config']) && is_string($data['config'])) {
                $decoded = json_decode($data['config'], true);
                if (is_array($decoded)) {
                    $data['config'] = $decoded;
                }
            }
        });
    }

    public function show(Promotion $promotion)
    {
        return $this->_show($promotion);
    }

    public function destroy(Promotion $promotion)
    {
        return $this->_destroy($promotion);
    }
}
