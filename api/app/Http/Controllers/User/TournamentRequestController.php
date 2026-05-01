<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Events\TournamentRequestSubmitted;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTournamentRequestRequest;
use App\Http\Resources\User\TournamentRequestResource;
use App\Models\TournamentRequest;
use App\Services\LeagueTournamentRequestProvisioner;
use Illuminate\Http\JsonResponse;

class TournamentRequestController extends Controller
{
    use BaseControllerTrait;

    /** Submit a new tournament service request. */
    public function store(
        StoreTournamentRequestRequest $request,
        LeagueTournamentRequestProvisioner $leagueProvisioner,
    ): JsonResponse {
        $data = $request->validated();
        $userId = $request->user()?->id;
        $data['user_id'] = $userId;
        $data['number_of_groups'] = max(1, min(16, (int) ($data['number_of_groups'] ?? 1)));

        $rawType = $data['tournament_type'] ?? '';
        $type = $rawType instanceof TournamentTypeEnum
            ? $rawType
            : TournamentTypeEnum::tryFrom((string) $rawType);

        if ($type === TournamentTypeEnum::LEAGUE && $userId !== null) {
            [$tournamentRequest, $tournament] = $leagueProvisioner->approveAndCreateTournament($data, $userId);
            $tournamentRequest->setRelation('tournament', $tournament);

            return $this->success(
                new TournamentRequestResource($tournamentRequest),
                'Your league is live. You are the organizer — continue setup from your tournament.',
                'CREATED'
            );
        }

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
