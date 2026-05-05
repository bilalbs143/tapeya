<?php

namespace App\Services\Broadcast;

use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;

final class ResolveMatchGraphicSession
{
    public static function forMatch(TournamentMatch $match): MatchGraphicSession
    {
        // Skip the theme query entirely when the session already exists.
        if ($match->graphicSession) {
            return $match->graphicSession;
        }

        $theme = GraphicTheme::query()->where('is_active', true)->orderBy('id')->first();
        if (! $theme) {
            abort(500, 'No graphic theme configured. Run database seeders (GraphicThemeSeeder).');
        }

        return MatchGraphicSession::firstOrCreate(
            ['match_id' => $match->id],
            [
                'graphic_theme_id' => $theme->id,
                'config' => $theme->default_config ?? [],
                'context' => [],
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]
        );
    }
}
