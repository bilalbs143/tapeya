<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Utils\Constants\ApiConstants;
use App\Http\Requests\Admin\StoreMatchGraphicCommandRequest;
use App\Http\Requests\Admin\UpdateMatchGraphicSessionRequest;
use App\Http\Resources\Admin\MatchGraphicCommandResource;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;

    /**
     * Get or create the graphic session for this match.
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        $session = $this->resolveOrCreateSession($match);
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session));
    }

    public function update(UpdateMatchGraphicSessionRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = $match->graphicSession ?? $this->resolveOrCreateSession($match);

        $data = $request->validated();
        if (isset($data['graphic_theme_id'])) {
            $theme = GraphicTheme::query()->whereKey($data['graphic_theme_id'])->where('is_active', true)->first();
            if (! $theme) {
                return $this->failure('Theme not found or inactive.', 'VALIDATION_ERROR');
            }
        }
        $data['updated_by'] = $request->user()?->id;
        $session->update($data);
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session), 'Graphic session updated.');
    }

    public function indexCommands(TournamentMatch $match): JsonResponse
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

    public function storeCommand(StoreMatchGraphicCommandRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = $this->resolveOrCreateSession($match);
        $data = $request->validated();

        $command = DB::transaction(function () use ($session, $data, $request) {
            $cmd = MatchGraphicCommand::query()->create([
                'match_graphic_session_id' => $session->id,
                'command_type' => $this->scalarEnumOrString($data['command_type']),
                'command_key' => $this->scalarEnumOrString($data['command_key']),
                'payload' => $data['payload'] ?? null,
                'display_mode' => isset($data['display_mode']) ? $this->scalarEnumOrString($data['display_mode']) : null,
                'created_by' => $request->user()?->id,
            ]);

            if ($data['activate'] ?? true) {
                $session->update([
                    'active_command_id' => $cmd->id,
                    'updated_by' => $request->user()?->id,
                ]);
            }

            return $cmd->fresh();
        });

        return $this->success(new MatchGraphicCommandResource($command), 'Command recorded.', 'CREATED');
    }

    public function activateCommand(TournamentMatch $match, MatchGraphicCommand $command): JsonResponse
    {
        $session = $match->graphicSession;
        if (! $session || (int) $command->match_graphic_session_id !== (int) $session->id) {
            return $this->failure('Command does not belong to this match session.', 'NOT_FOUND');
        }

        $session->update([
            'active_command_id' => $command->id,
            'updated_by' => request()->user()?->id,
        ]);

        $command->load('session');

        return $this->success(new MatchGraphicCommandResource($command), 'Active graphic updated.');
    }

    /**
     * Remove all stored graphic commands for this match session (history + active pointer).
     */
    public function clearCommandHistory(TournamentMatch $match): JsonResponse
    {
        $session = $match->graphicSession;
        if (! $session) {
            return $this->success(null, 'No command history for this match.');
        }

        DB::transaction(function () use ($session) {
            MatchGraphicCommand::query()
                ->where('match_graphic_session_id', $session->id)
                ->delete();

            $session->update([
                'active_command_id' => null,
                'updated_by' => request()->user()?->id,
            ]);
        });

        $session->refresh();
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session), 'Recent commands cleared.');
    }

    private function scalarEnumOrString(mixed $value): string
    {
        return $value instanceof \BackedEnum ? $value->value : (string) $value;
    }

    private function resolveOrCreateSession(TournamentMatch $match): MatchGraphicSession
    {
        return ResolveMatchGraphicSession::forMatch($match);
    }
}
