<?php

namespace App\Services\Broadcast;

use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Graphics\MatchGraphicSignedUrlService;
use RuntimeException;

/**
 * App-side graphic setup: theme → session → lifecycle command → signed overlay URL.
 *
 * Active command follows match phase: THIS_MATCH → TOSS_LT → LT_DEFAULT.
 * Does not rotate an existing overlay URL (OBS would go blank). Call
 * {@see MatchGraphicSignedUrlService::resolve()} from the signed-url endpoint to refresh.
 */
final class StartUserOwnedGraphicOverlay
{
    public function __construct(
        private readonly CreateMatchGraphicSession $createMatchGraphicSession,
        private readonly SyncUserOwnedOverlayCommand $syncUserOwnedOverlayCommand,
        private readonly MatchGraphicSignedUrlService $signedUrlService,
        private readonly GraphicContextOrchestrator $graphicContextOrchestrator,
    ) {}

    /**
     * @param  array<string, mixed>|null  $config  Theme schema values; null uses theme defaults.
     */
    public function start(
        TournamentMatch $match,
        int $graphicThemeId,
        ?int $userId,
        ?array $config = null,
    ): MatchGraphicSession {
        $theme = GraphicTheme::query()
            ->whereKey($graphicThemeId)
            ->where('is_active', true)
            ->firstOrFail();

        $match->unsetRelation('graphicSession');
        $session = FindMatchGraphicSession::forMatch($match);
        $created = $session === null;
        $themeChanged = false;
        $configChanged = false;

        if ($session === null) {
            $session = $this->createMatchGraphicSession->create(
                $match,
                $theme->id,
                $config ?? $this->defaultConfig($theme),
                $userId,
            );
            $match->setRelation('graphicSession', $session);
        } else {
            $updates = ['updated_by' => $userId];

            if ((int) $session->graphic_theme_id !== (int) $theme->id) {
                $updates['graphic_theme_id'] = $theme->id;
                $themeChanged = true;
                if ($config === null) {
                    $updates['config'] = $this->defaultConfig($theme);
                    $configChanged = true;
                }
            }

            if ($config !== null) {
                $updates['config'] = $config;
                $configChanged = true;
            }

            if ($themeChanged || $configChanged) {
                $session->update($updates);
            }
        }

        $session = $session->fresh() ?? $session;
        $activated = $this->syncUserOwnedOverlayCommand->ensure($session, $match->fresh() ?? $match, $userId);
        $session = $session->fresh() ?? $session;

        if ($this->needsSignedUrl($session)) {
            try {
                $this->signedUrlService->resolve($session);
            } catch (RuntimeException) {
                // Session is usable; overlay URL can be issued later when graphics settings exist.
            }
            $session = $session->fresh() ?? $session;
        }

        if ($created || $themeChanged || $configChanged || $activated) {
            $this->graphicContextOrchestrator->syncAndBroadcast($match);
            $match->unsetRelation('graphicSession');
            $session = FindMatchGraphicSession::forMatch($match) ?? $session;
        }

        return $session->fresh() ?? $session;
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultConfig(GraphicTheme $theme): array
    {
        $defaults = is_array($theme->default_config) ? $theme->default_config : [];

        foreach ($theme->config_schema['properties'] ?? [] as $prop) {
            $key = $prop['key'] ?? null;
            if (! is_string($key) || $key === '' || array_key_exists($key, $defaults)) {
                continue;
            }
            if (array_key_exists('default', $prop)) {
                $defaults[$key] = $prop['default'];
            }
        }

        return $defaults;
    }

    private function needsSignedUrl(MatchGraphicSession $session): bool
    {
        return $session->signed_overlay_url === null || $session->signed_overlay_url === '';
    }
}
