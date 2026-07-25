<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Http\Controllers\Admin\Concerns\InteractsWithGraphicCommandPayload;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMatchGraphicCommandRequest;
use App\Http\Resources\Admin\MatchGraphicCommandResource;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\MatchGraphicCommand;
use App\Models\TournamentMatch;
use App\Services\Broadcast\FindMatchGraphicSession;
use App\Services\Broadcast\GraphicCareerEnricher;
use App\Services\Broadcast\GraphicCommandHistoryService;
use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Services\Broadcast\GraphicFollowUpScheduler;
use App\Services\Broadcast\GraphicPlayerProfileEnricher;
use App\Utils\Constants\ApiConstants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Graphic command history and activation for a match session.
 */
class GraphicCommandController extends Controller
{
    use BaseControllerTrait;
    use InteractsWithGraphicCommandPayload;

    public function __construct(
        private readonly GraphicCommandHistoryService $graphicCommandHistory,
        private readonly GraphicCareerEnricher $careerPayloadEnricher,
        private readonly GraphicPlayerProfileEnricher $playerProfileEnricher,
        private readonly GraphicContextOrchestrator $graphicContextOrchestrator,
        private readonly GraphicFollowUpScheduler $graphicFollowUps,
    ) {}

    public function index(TournamentMatch $match): JsonResponse
    {
        $perPage = (int) request('per_page', ApiConstants::PER_PAGE);
        $perPage = max(1, min(100, $perPage));

        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            $empty = new LengthAwarePaginator([], 0, $perPage, 1);

            return $this->success(MatchGraphicCommandResource::collection($empty));
        }

        $paginator = $session->commands()->paginate($perPage)->appends(request()->query());

        return $this->success(MatchGraphicCommandResource::collection($paginator));
    }

    public function store(StoreMatchGraphicCommandRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            return $this->failure(
                'Configure graphics settings before sending commands.',
                'VALIDATION_ERROR',
            );
        }

        $data = $request->validated();

        $match->refresh();
        $key = $this->resolveCommandKey($data['command_key'] ?? null);
        if ($key === GraphicCommandKeyEnum::MOM && $match->player_of_match_user_id === null) {
            return $this->failure(
                'Set Man of the Match in the scoring app first.',
                'VALIDATION_ERROR',
            );
        }

        $command = DB::transaction(function () use ($session, $data, $request, $match, $key) {
            [$payload, $hadPayloadKey, $originalPayload] = $this->prepareCommandPayload($data, $key, $match);

            $cmd = MatchGraphicCommand::query()->create([
                'match_graphic_session_id' => $session->id,
                'command_type' => $this->scalarEnumOrString($data['command_type']),
                'command_key' => $this->scalarEnumOrString($data['command_key']),
                'payload' => $this->persistedPayload($hadPayloadKey, $originalPayload, $payload),
                'display_mode' => isset($data['display_mode']) ? $this->scalarEnumOrString($data['display_mode']) : null,
                'created_by' => $request->user()?->id,
            ]);

            if ($data['activate'] ?? true) {
                $session->refresh();

                $session->update([
                    'active_command_id' => $cmd->id,
                    'updated_by' => $request->user()?->id,
                ]);

                $this->graphicContextOrchestrator->syncAndBroadcast($match);
                $this->graphicFollowUps->onCommandActivated($match, $cmd, $request->user()?->id);
            }

            return $cmd->fresh();
        });

        return $this->success(new MatchGraphicCommandResource($command), 'Command recorded.', 'CREATED');
    }

    public function activate(Request $request, TournamentMatch $match, MatchGraphicCommand $command): JsonResponse
    {
        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session || (int) $command->match_graphic_session_id !== (int) $session->id) {
            return $this->failure('Command does not belong to this match session.', 'NOT_FOUND');
        }

        DB::transaction(function () use ($request, $session, $command, $match) {
            $this->enrichStoredCommandPayloadIfNeeded($command);

            $session->update([
                'active_command_id' => $command->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->graphicContextOrchestrator->syncAndBroadcast($match);
            $this->graphicFollowUps->onCommandActivated($match, $command, $request->user()?->id);
        });

        $command->load('session');

        return $this->success(new MatchGraphicCommandResource($command), 'Active graphic updated.');
    }

    /**
     * Remove all stored graphic commands for this match session (history + active pointer).
     */
    public function destroyHistory(TournamentMatch $match): JsonResponse
    {
        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            return $this->success(null, 'No command history for this match.');
        }

        $this->graphicCommandHistory->clearEntireSession($session, request()->user()?->id);

        $session->refresh();
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session), 'Recent commands cleared.');
    }
}
