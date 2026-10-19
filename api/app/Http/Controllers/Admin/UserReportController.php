<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserReportResource;
use App\Models\UserReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserReportController extends Controller
{
    public function index(Request $request)
    {
        $query = UserReport::query()
            ->with([
                'reporter:id,name,nickname,phone',
                'reportedUser:id,name,nickname,phone,status',
            ])
            ->orderByDesc('id');

        $status = $request->query('status') ?? $request->input('filter.status');
        if (filled($status)) {
            $query->where('status', $status);
        }

        $source = $request->query('source') ?? $request->input('filter.source');
        if (filled($source)) {
            $query->where('source', $source);
        }

        $perPage = max(1, min((int) $request->query('per_page', 20), 100));

        return UserReportResource::collection($query->paginate($perPage));
    }

    public function update(Request $request, UserReport $userReport): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:open,reviewed,actioned,dismissed'],
        ]);

        $userReport->update(['status' => $data['status']]);

        return response()->success(
            new UserReportResource($userReport->fresh()->load([
                'reporter:id,name,nickname,phone',
                'reportedUser:id,name,nickname,phone,status',
            ])),
            'User report updated.'
        );
    }
}
