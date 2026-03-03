<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Events\TournamentRequestSubmitted;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTournamentRequestRequest;
use App\Http\Resources\User\TournamentRequestResource;
use App\Models\TournamentRequest;
use Illuminate\Http\JsonResponse;

class TournamentRequestController extends Controller
{
    use BaseControllerTrait;

    /** Submit a new tournament service request. */
    public function store(StoreTournamentRequestRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()?->id;
        $data['status'] = TournamentRequestStatusEnum::PENDING;

        $tournamentRequest = TournamentRequest::create($data);
        event(new TournamentRequestSubmitted($tournamentRequest));

        return $this->success(
            new TournamentRequestResource($tournamentRequest),
            'Tournament request submitted successfully. Our team will review and contact you shortly.',
            'CREATED'
        );
    }
}
