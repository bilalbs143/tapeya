<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Http\Requests\Admin\StoreTournamentInterestCampaignRequest;
use App\Http\Requests\Admin\UpdateTournamentInterestCampaignRequest;
use App\Http\Resources\Admin\TournamentInterestCampaignResource;
use App\Models\Tournament;
use App\Models\TournamentInterestCampaign;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TournamentInterestCampaignController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(
            TournamentInterestCampaign::class,
            TournamentInterestCampaignResource::class,
            'interest campaign',
        );
    }

    protected function baseQuery()
    {
        return TournamentInterestCampaign::query()
            ->with(['tournament', 'creator'])
            ->withCount('submissions');
    }

    public function show(TournamentInterestCampaign $campaign): JsonResponse
    {
        return $this->_show($campaign);
    }

    public function store(StoreTournamentInterestCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Snapshot tournament name so the public form's title is stable across renames.
        if (! empty($data['tournament_id'])) {
            $tournament = Tournament::query()->findOrFail($data['tournament_id']);
            $data['tournament_name'] = $tournament->tournament_name;
        }

        $data['slug'] = $this->resolveUniqueSlug($data['slug'] ?? null, $data['tournament_name']);
        $data['status'] = $data['status'] ?? TournamentInterestCampaignStatusEnum::OPEN->value;
        $data['created_by'] = $request->user()?->id;

        unset($data['logo']);

        try {
            $campaign = DB::transaction(function () use ($data) {
                if ($this->isShowInSidebarEnabled($data)) {
                    $this->clearShowInSidebarOnOtherCampaigns();
                }
                if ($this->isShowDialogEnabled($data)) {
                    $this->clearShowDialogOnOtherCampaigns();
                }

                return TournamentInterestCampaign::create($data);
            });
        } catch (UniqueConstraintViolationException) {
            return $this->failure('A campaign with this slug already exists.', 'VALIDATION_ERROR');
        }

        return $this->success(
            new TournamentInterestCampaignResource($this->refresh($campaign)),
            'Interest campaign created.',
            'CREATED',
        );
    }

    public function update(
        UpdateTournamentInterestCampaignRequest $request,
        TournamentInterestCampaign $campaign,
    ): JsonResponse {
        $data = $request->validated();
        unset($data['logo']); // File field — handled by the generic media endpoint

        if (array_key_exists('tournament_id', $data)) {
            if (! empty($data['tournament_id'])) {
                $tournament = Tournament::query()->findOrFail($data['tournament_id']);
                $data['tournament_name'] = $tournament->tournament_name;
            }
        }

        if (array_key_exists('slug', $data)) {
            $data['slug'] = $this->resolveUniqueSlug(
                $data['slug'],
                $data['tournament_name'] ?? $campaign->tournament_name,
                $campaign->id,
            );
        }

        DB::transaction(function () use ($campaign, $data) {
            if (array_key_exists('show_in_sidebar', $data) && $this->isShowInSidebarEnabled($data)) {
                $this->clearShowInSidebarOnOtherCampaigns($campaign->id);
            }
            if (array_key_exists('show_dialog', $data) && $this->isShowDialogEnabled($data)) {
                $this->clearShowDialogOnOtherCampaigns($campaign->id);
            }
            $campaign->update($data);
        });

        return $this->success(
            new TournamentInterestCampaignResource($this->refresh($campaign)),
            'Interest campaign updated.',
        );
    }

    public function destroy(TournamentInterestCampaign $campaign): JsonResponse
    {
        $logoPath = $campaign->logo_path;
        $response = $this->_destroy($campaign, 'Interest campaign deleted.');
        if ($logoPath) {
            Storage::disk(config('filesystems.media_disk'))->delete($logoPath);
        }

        return $response;
    }

    protected function resolveUniqueSlug(?string $candidate, string $tournamentName, ?int $ignoreId = null): string
    {
        $base = Str::slug($candidate !== null && $candidate !== '' ? $candidate : $tournamentName);
        if ($base === '') {
            $base = 'campaign';
        }

        $slug = $base;
        $i = 2;
        while (
            TournamentInterestCampaign::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }

    /**
     * Only one interest campaign may have show_in_sidebar enabled at a time.
     */
    private function isShowInSidebarEnabled(array $data): bool
    {
        if (! array_key_exists('show_in_sidebar', $data)) {
            return false;
        }

        return filter_var($data['show_in_sidebar'], FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Set show_in_sidebar to false on all campaigns except the given id (omit on create).
     */
    private function clearShowInSidebarOnOtherCampaigns(?int $exceptCampaignId = null): void
    {
        TournamentInterestCampaign::query()
            ->when($exceptCampaignId !== null, fn ($q) => $q->where('id', '!=', $exceptCampaignId))
            ->update(['show_in_sidebar' => false]);
    }

    /**
     * Only one interest campaign may have show_dialog enabled at a time.
     */
    private function isShowDialogEnabled(array $data): bool
    {
        if (! array_key_exists('show_dialog', $data)) {
            return false;
        }

        return filter_var($data['show_dialog'], FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Set show_dialog to false on all campaigns except the given id (omit on create).
     */
    private function clearShowDialogOnOtherCampaigns(?int $exceptCampaignId = null): void
    {
        TournamentInterestCampaign::query()
            ->when($exceptCampaignId !== null, fn ($q) => $q->where('id', '!=', $exceptCampaignId))
            ->update(['show_dialog' => false]);
    }
}
