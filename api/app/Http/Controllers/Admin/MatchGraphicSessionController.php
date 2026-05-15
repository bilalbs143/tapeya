<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Events\Broadcast\Graphics\MatchGraphicCommandActivated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMatchGraphicCommandRequest;
use App\Http\Requests\Admin\UpdateMatchGraphicSessionRequest;
use App\Http\Resources\Admin\MatchGraphicCommandResource;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\BuildMatchGraphicContextService;
use App\Services\Broadcast\MatchGraphicCareerPayloadEnricher;
use App\Services\Broadcast\MatchGraphicCommandHistoryService;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use App\Services\Overlay\MatchGraphicOverlaySigner;
use App\Settings\OverlaySettings;
use App\Utils\Constants\ApiConstants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly OverlaySettings $overlaySettings,
        private readonly MatchGraphicCommandHistoryService $graphicCommandHistory,
        private readonly MatchGraphicCareerPayloadEnricher $careerPayloadEnricher,
    ) {}

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

    /**
     * Build a time-limited signed URL for the web app overlay (OBS / vMix browser source).
     */
    public function signedOverlayUrl(Request $request, TournamentMatch $match): JsonResponse
    {
        $ttlSeconds = $this->overlaySettings->defaultTtlSeconds;
        if ($ttlSeconds < 1) {
            $ttlSeconds = 86400;
        }
        $expires = time() + $ttlSeconds;
        $signature = MatchGraphicOverlaySigner::fromSettings($this->overlaySettings)->sign((int) $match->id, $expires);

        $theme = (string) $request->query('theme', 'tapeya-basic');
        $base = rtrim((string) ($this->overlaySettings->frontendUrl ?? ''), '/');
        $query = http_build_query([
            'theme' => $theme,
            'expires' => $expires,
            'signature' => $signature,
        ], '', '&', PHP_QUERY_RFC3986);

        $url = "{$base}/overlay/{$match->id}?{$query}";

        return $this->success([
            'url' => $url,
            'expires_at' => now()->setTimestamp($expires)->toIso8601String(),
        ]);
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

    /**
     * Record the next batsman and/or bowler selected in the scoring app before
     * any ball has been bowled, so the graphic overlay shows them immediately
     * instead of showing an empty slot.
     *
     * Body: { next_batter_id?: int, next_non_striker_id?: int, next_bowler_id?: int }
     * Omit a key to leave its existing pending value untouched.
     * Pass null to explicitly clear a specific field.
     */
    public function setPendingPlayers(Request $request, TournamentMatch $match, BuildMatchGraphicContextService $service): JsonResponse
    {
        $data = $request->validate([
            'next_batter_id' => 'sometimes|nullable|integer|min:1',
            'next_non_striker_id' => 'sometimes|nullable|integer|min:1',
            'next_bowler_id' => 'sometimes|nullable|integer|min:1',
        ]);

        $service->setPendingAndBroadcast($match, $data);

        return $this->success(null, 'Pending players updated.');
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

    public function activateCommand(Request $request, TournamentMatch $match, MatchGraphicCommand $command): JsonResponse
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
    public function clearCommandHistory(TournamentMatch $match): JsonResponse
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

    private function scalarEnumOrString(mixed $value): string
    {
        return $value instanceof \BackedEnum ? $value->value : (string) $value;
    }

    private function resolveCommandKey(mixed $raw): ?GraphicCommandKeyEnum
    {
        if ($raw instanceof GraphicCommandKeyEnum) {
            return $raw;
        }

        return GraphicCommandKeyEnum::tryFrom((string) ($raw ?? ''));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: bool, 2: mixed}
     */
    private function prepareCommandPayload(array $data, ?GraphicCommandKeyEnum $key): array
    {
        $hadPayloadKey = array_key_exists('payload', $data);
        $originalPayload = $hadPayloadKey ? $data['payload'] : null;
        $payload = is_array($originalPayload) ? $originalPayload : [];

        if ($key !== null) {
            $payload = $this->careerPayloadEnricher->enrichForCommandKey($payload, $key);
        }

        return [$payload, $hadPayloadKey, $originalPayload];
    }

    /**
     * @param  array<string, mixed>|null  $original
     * @param  array<string, mixed>  $work
     */
    private function persistedPayload(bool $hadPayloadKey, mixed $original, array $work): ?array
    {
        if ($work !== []) {
            return $work;
        }
        if ($hadPayloadKey && is_array($original)) {
            return [];
        }

        return null;
    }

    private function enrichStoredCommandPayloadIfNeeded(MatchGraphicCommand $command): void
    {
        $key = $this->resolveCommandKey($command->command_key);
        if ($key === null) {
            return;
        }

        $original = $command->payload;
        $payload = is_array($original) ? $original : [];
        $enriched = $this->careerPayloadEnricher->enrichForCommandKey($payload, $key);

        if ($enriched === $payload) {
            return;
        }

        $command->update(['payload' => $enriched]);
        $command->refresh();
    }

    private function resolveOrCreateSession(TournamentMatch $match): MatchGraphicSession
    {
        return ResolveMatchGraphicSession::forMatch($match);
    }
}
