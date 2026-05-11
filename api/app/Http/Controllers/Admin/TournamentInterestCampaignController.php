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
    private const LOGO_DIR = 'interest-campaigns/logos';

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

        $this->storeImage($request, 'logo', self::LOGO_DIR, $data);
        if (array_key_exists('logo', $data)) {
            $data['logo_path'] = $data['logo'];
            unset($data['logo']);
        }

        try {
            $campaign = DB::transaction(function () use ($data) {
                if ($this->isShowInSidebarEnabled($data)) {
                    $this->clearShowInSidebarOnOtherCampaigns();
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
        $removeLogo = (bool) ($data['remove_logo'] ?? false);
        unset($data['remove_logo']);

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

        if ($request->hasFile('logo')) {
            $this->storeImage($request, 'logo', self::LOGO_DIR, $data);
            if (array_key_exists('logo', $data)) {
                $this->deleteLogo($campaign->logo_path);
                $data['logo_path'] = $data['logo'];
                unset($data['logo']);
            }
        } else {
            unset($data['logo']);
            if ($removeLogo) {
                $this->deleteLogo($campaign->logo_path);
                $data['logo_path'] = null;
            }
        }

        DB::transaction(function () use ($campaign, $data) {
            if (array_key_exists('show_in_sidebar', $data) && $this->isShowInSidebarEnabled($data)) {
                $this->clearShowInSidebarOnOtherCampaigns($campaign->id);
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
        $this->deleteLogo($logoPath);

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

    private function deleteLogo(?string $path): void
    {
        if ($path) {
            Storage::disk(config('filesystems.media_disk'))->delete($path);
        }
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
}
