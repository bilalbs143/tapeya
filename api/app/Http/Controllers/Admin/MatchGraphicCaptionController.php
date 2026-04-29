<?php

namespace App\Http\Controllers\Admin;

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
        if (! $session) {
            return MatchGraphicCaptionResource::collection(new Collection)->response();
        }

        return MatchGraphicCaptionResource::collection(
            $session->captions()->get()
        )->response();
    }

    public function store(StoreMatchGraphicCaptionRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = ResolveMatchGraphicSession::forMatch($match);
        if ($session->captions()->exists()) {
            return $this->failure('A caption already exists for this match. Edit or delete it first.', 'VALIDATION_ERROR');
        }

        $data = $request->validated();

        $caption = $session->captions()->create($data);

        return $this->success(new MatchGraphicCaptionResource($caption), 'Caption saved.', 'CREATED');
    }

    public function update(
        UpdateMatchGraphicCaptionRequest $request,
        TournamentMatch $match,
        MatchGraphicCaption $caption
    ): JsonResponse {
        $this->assertCaptionForMatch($match, $caption);

        $caption->update($request->validated());

        return $this->success(new MatchGraphicCaptionResource($caption->fresh()), 'Caption updated.');
    }

    public function destroy(TournamentMatch $match, MatchGraphicCaption $caption): JsonResponse|SymfonyResponse
    {
        $this->assertCaptionForMatch($match, $caption);
        $caption->delete();

        return $this->noContent();
    }

    private function assertCaptionForMatch(TournamentMatch $match, MatchGraphicCaption $caption): void
    {
        $session = $match->graphicSession;
        if (! $session || (int) $caption->match_graphic_session_id !== (int) $session->id) {
            abort(404);
        }
    }
}
