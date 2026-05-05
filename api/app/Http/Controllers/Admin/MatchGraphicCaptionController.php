<?php

namespace App\Http\Controllers\Admin;

use App\Events\Broadcast\Graphics\MatchGraphicCaptionChanged;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMatchGraphicCaptionRequest;
use App\Http\Requests\Admin\UpdateMatchGraphicCaptionRequest;
use App\Http\Resources\Admin\MatchGraphicCaptionResource;
use App\Models\MatchGraphicCaption;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MatchGraphicCaptionController extends Controller
{
    use BaseControllerTrait;

    public function index(TournamentMatch $match): JsonResponse
    {
        $session = $match->graphicSession;

        $captions = $session ? $session->captions()->get() : new Collection;

        return $this->success(MatchGraphicCaptionResource::collection($captions));
    }

    public function store(StoreMatchGraphicCaptionRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = ResolveMatchGraphicSession::forMatch($match);
        if ($session->captions()->exists()) {
            return $this->failure('A caption already exists for this match. Edit or delete it first.', 'VALIDATION_ERROR');
        }

        $data = $request->validated();

        $caption = $session->captions()->create($data);

        MatchGraphicCaptionChanged::dispatch($session, 'saved');

        return $this->success(new MatchGraphicCaptionResource($caption), 'Caption saved.', 'CREATED');
    }

    public function update(
        UpdateMatchGraphicCaptionRequest $request,
        TournamentMatch $match,
        MatchGraphicCaption $caption
    ): JsonResponse {
        if (! $this->captionBelongsToMatch($match, $caption)) {
            return $this->failure('Caption does not belong to this match session.', 'NOT_FOUND');
        }

        $caption->update($request->validated());

        MatchGraphicCaptionChanged::dispatch($caption->session, 'saved');

        return $this->success(new MatchGraphicCaptionResource($caption->fresh()), 'Caption updated.');
    }

    public function destroy(TournamentMatch $match, MatchGraphicCaption $caption): JsonResponse|SymfonyResponse
    {
        if (! $this->captionBelongsToMatch($match, $caption)) {
            return $this->failure('Caption does not belong to this match session.', 'NOT_FOUND');
        }

        $session = $caption->session;
        $caption->delete();

        MatchGraphicCaptionChanged::dispatch($session, 'deleted');

        return $this->noContent();
    }

    private function captionBelongsToMatch(TournamentMatch $match, MatchGraphicCaption $caption): bool
    {
        $session = $match->graphicSession;

        return $session && (int) $caption->match_graphic_session_id === (int) $session->id;
    }
}
