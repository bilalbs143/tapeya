<?php

namespace App\Http\Controllers\Admin;

use App\Events\Broadcast\Graphics\MatchGraphicCommandActivated;
use App\Http\Controllers\Admin\Concerns\InteractsWithGraphicCommandPayload;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMatchGraphicCommandRequest;
use App\Http\Resources\Admin\MatchGraphicCommandResource;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicCareerEnricher;
use App\Services\Broadcast\GraphicCommandHistoryService;
use App\Services\Broadcast\ResolveMatchGraphicSession;
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
    ) {}

    public function index(TournamentMatch $match): JsonResponse
    {
        $perPage = (int) request('per_page', ApiConstants::PER_PAGE);
        $perPage = max(1, min(100, $perPage));

        $session = $match->graphicSession;
        if (! $session) {
            $empty = new LengthAwarePaginator([], 0, $perPage, 1);

            return $this->success(MatchGraphicCommandResource::collection($empty));
        }

        $paginator = $session->commands()->paginate($perPage)->appends(request()->query());

        return $this->success(MatchGraphicCommandResource::collection($paginator));
    }

    public function store(StoreMatchGraphicCommandRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = $this->resolveOrCreateSession($match);
        $data = $request->validated();

        $command = DB::transaction(function () use ($session, $data, $request, $match) {
            $key = $this->resolveCommandKey($data['command_key'] ?? null);
            [$payload, $hadPayloadKey, $originalPayload] = $this->prepareCommandPayload($data, $key);

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

                // Pre-load the match relation so MatchGraphicCommandActivated::broadcastContext
                // does not fire an extra DB query.
                $session->setRelation('match', $match);
                MatchGraphicCommandActivated::dispatch($session, $cmd);
            }

            return $cmd->fresh();
        });

        return $this->success(new MatchGraphicCommandResource($command), 'Command recorded.', 'CREATED');
    }

    public function activate(Request $request, TournamentMatch $match, MatchGraphicCommand $command): JsonResponse
    {
        $session = $match->graphicSession;
        if (! $session || (int) $command->match_graphic_session_id !== (int) $session->id) {
            return $this->failure('Command does not belong to this match session.', 'NOT_FOUND');
        }

        DB::transaction(function () use ($request, $session, $command, $match) {
            $this->enrichStoredCommandPayloadIfNeeded($command);

            $session->update([
                'active_command_id' => $command->id,
                'updated_by' => $request->user()?->id,
            ]);

            // Pre-load the match relation so broadcastContext avoids an extra query.
            $session->setRelation('match', $match);
            MatchGraphicCommandActivated::dispatch($session, $command);
        });

        $command->load('session');

        return $this->success(new MatchGraphicCommandResource($command), 'Active graphic updated.');
    }

    /**
     * Remove all stored graphic commands for this match session (history + active pointer).
     */
    public function destroyHistory(TournamentMatch $match): JsonResponse
    {
        $session = $match->graphicSession;
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

    private function resolveOrCreateSession(TournamentMatch $match): MatchGraphicSession
    {
        return ResolveMatchGraphicSession::forMatch($match);
    }
}
