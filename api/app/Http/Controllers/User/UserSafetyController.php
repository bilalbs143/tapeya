<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use App\Services\Safety\UserBlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSafetyController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly UserBlockService $blocks,
    ) {}

    public function acceptTerms(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->forceFill(['terms_accepted_at' => now()])->save();

        return $this->success(UserResource::self($user->fresh()), 'Terms accepted.');
    }

    public function block(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['nullable', 'string', 'in:spam,harassment,inappropriate,violence,copyright,other'],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = $this->blocks->block(
            $request->user(),
            $user,
            $data['reason'] ?? 'other',
            $data['details'] ?? null,
        );

        return $this->success($result, 'User blocked.');
    }

    public function unblock(Request $request, User $user): JsonResponse
    {
        $result = $this->blocks->unblock($request->user(), $user);

        return $this->success($result, 'User unblocked.');
    }

    public function report(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'in:spam,harassment,inappropriate,violence,copyright,other'],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = $this->blocks->report(
            $request->user(),
            $user,
            $data['reason'],
            $data['details'] ?? null,
        );

        return $this->success($result, 'Report submitted.');
    }
}
