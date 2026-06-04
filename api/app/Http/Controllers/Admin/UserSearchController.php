<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\TournamentBroadcasterUserResource;
use App\Http\Resources\User\UserResource;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * GET admin/users/search — unified typeahead for app users (team pickers, tournament squads,
 * broadcast staff, sponsor-only organizer pickers, etc.).
 */
class UserSearchController extends Controller
{
    use BaseControllerTrait;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'app_role' => ['sometimes', 'nullable', Rule::enum(AppRoleEnum::class)],
            'for_squad' => ['sometimes', 'boolean'],
            'context' => ['sometimes', 'nullable', 'string', Rule::in(['broadcaster'])],
            'tournament_id' => ['required_if:context,broadcaster', 'nullable', 'integer', 'exists:tournaments,id'],
        ]);

        if (($validated['context'] ?? null) === 'broadcaster') {
            return $this->broadcasterResults((int) $validated['tournament_id'], trim((string) ($validated['search'] ?? $request->query('search', ''))));
        }

        $term = trim((string) ($validated['search'] ?? $request->query('search', '')));
        $query = User::query()->user()->notBlocked();

        if ($request->boolean('for_squad')) {
            $query->eligibleForTournamentSquad();
        } else {
            $appRole = $validated['app_role'] ?? $request->query('app_role');
            $appRoleSlug = $appRole instanceof AppRoleEnum ? $appRole->value : (is_string($appRole) ? $appRole : null);
            if ($appRoleSlug !== null && $appRoleSlug !== '') {
                $query->whereHas('roles', function ($q) use ($appRoleSlug): void {
                    $q->where('roles.guard', RoleGuardEnum::APP->value)
                        ->where('roles.slug', $appRoleSlug);
                });
            }
        }

        if ($term !== '') {
            $safe = '%'.addcslashes($term, '%_\\').'%';
            $query->where(function ($w) use ($safe): void {
                $w->where('name', 'like', $safe)
                    ->orWhere('nickname', 'like', $safe)
                    ->orWhere('email', 'like', $safe)
                    ->orWhere('phone', 'like', $safe);
            });
        }

        $users = $query->orderBy('name')->limit(25)->get();

        return $this->success(UserResource::collection($users));
    }

    private function broadcasterResults(int $tournamentId, string $search): JsonResponse
    {
        $tournament = Tournament::query()->findOrFail($tournamentId);
        $attachedId = $tournament->broadcasters()->first()?->id;

        $query = User::query()
            ->user()
            ->notBlocked()
            ->when($search !== '', fn ($q) => $q->search($search))
            ->when($attachedId !== null, fn ($q) => $q->where('id', '!=', $attachedId))
            ->orderBy('name')
            ->limit(20);

        return $this->success(TournamentBroadcasterUserResource::collection($query->get()));
    }
}
