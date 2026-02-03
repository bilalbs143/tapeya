<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Template\CreateTemplateRequest;
use App\Http\Requests\v1\Admin\Template\UpdateTemplateRequest;
use App\Http\Resources\v1\Template\TemplateResource;
use App\Models\Template;

class TemplateController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Template::class, TemplateResource::class, 'template');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function store(CreateTemplateRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateTemplateRequest $request, Template $template)
    {
        return $this->_patch($request, $template);
    }

    public function show(Template $template)
    {
        return $this->_show($template);
    }

    public function destroy(Template $template)
    {
        return $this->_destroy($template);
    }
}
