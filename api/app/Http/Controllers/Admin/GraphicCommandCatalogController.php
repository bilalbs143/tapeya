<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Support\Broadcast\GraphicCommandCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class GraphicCommandCatalogController extends Controller
{
    use BaseControllerTrait;

    /**
     * Dynamic command groups + actions for the match graphics controller (backoffice).
     * Cached for 10 minutes — catalog only changes on deploy.
     */
    public function index(): JsonResponse
    {
        $catalog = Cache::remember(
            'admin:graphic-command-catalog:v1',
            600,
            static fn () => GraphicCommandCatalog::groupedForController(),
        );

        return $this->success($catalog);
    }
}
