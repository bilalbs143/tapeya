<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\StaticPageResource;
use App\Models\StaticPage;
use Illuminate\Http\JsonResponse;

class StaticPageController extends Controller
{
    use BaseControllerTrait;

    /**
     * Public CMS page by slug (e.g. terms-of-use, privacy-policy).
     */
    public function show(string $slug): JsonResponse
    {
        $page = StaticPage::query()->where('slug', $slug)->first();
        if (! $page) {
            return response()->failure('Not found.', 'NOT_FOUND');
        }

        return $this->success(new StaticPageResource($page));
    }
}
