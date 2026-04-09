<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Support\Broadcast\GraphicCommandCatalog;
use Illuminate\Http\JsonResponse;

class GraphicCommandCatalogController extends Controller
{
    use BaseControllerTrait;

    /**
     * Dynamic command groups + actions for the match graphics controller (backoffice).
     */
    public function index(): JsonResponse
    {
        return $this->success(GraphicCommandCatalog::groupedForController());
    }
}
