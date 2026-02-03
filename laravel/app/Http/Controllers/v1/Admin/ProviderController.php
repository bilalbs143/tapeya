<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Provider\UpdateProviderRequest;
use App\Http\Resources\v1\Provider\ProviderResource;
use App\Models\Provider;

class ProviderController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Provider::class, ProviderResource::class, 'provider');
    }

    protected function baseQuery()
    {
        return $this->model->with('company');
    }

    public function show(Provider $provider)
    {
        return $this->_show($provider);
    }

    public function patch(UpdateProviderRequest $request, Provider $provider)
    {
        return $this->_patch($request, $provider, dataMapper: function (&$data) {
            if (isset($data['is_active'])) {
                $data['disabled_at'] = $data['is_active'] ? null : now();
            }
        });
    }
}
