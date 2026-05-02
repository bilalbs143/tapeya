<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\GraphicThemeResource;
use App\Models\GraphicTheme;
use Illuminate\Http\JsonResponse;

class GraphicThemeController extends Controller
{
    use BaseControllerTrait;
    /**
     * List active graphics themes for the match controller settings UI.
     */
    public function index(): JsonResponse
    {
        $themes = GraphicTheme::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->success(GraphicThemeResource::collection($themes));
    }
}
