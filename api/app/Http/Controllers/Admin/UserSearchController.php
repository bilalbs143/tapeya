<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserSearchResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET admin/users/search — one typeahead for any app-user picker
 * (organizer, team owner, squad, broadcast staff, etc.).
 */
class UserSearchController extends Controller
{
    use BaseControllerTrait;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $term = trim((string) ($validated['search'] ?? $request->query('search', '')));

        $query = User::query()
            ->user()
            ->notBlocked()
            ->orderBy('name')
            ->limit(25);

        if ($term !== '') {
            $query->search($term);
        }

        return $this->success(UserSearchResource::collection($query->get()));
    }
}
