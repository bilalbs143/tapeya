<?php

namespace App\Services\Broadcast;

use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;

final class ResolveMatchGraphicSession
{
    public static function forMatch(TournamentMatch $match): MatchGraphicSession
    {
        $theme = GraphicTheme::query()->where('is_active', true)->orderBy('id')->first();
        if (! $theme) {
            abort(500, 'No graphic theme configured. Run database seeders (GraphicThemeSeeder).');
        }

        return DB::transaction(function () use ($match, $theme) {
            return MatchGraphicSession::query()->firstOrCreate(
                ['match_id' => $match->id],
                [
                    'graphic_theme_id' => $theme->id,
                    'config' => $theme->default_config ?? [],
                    'context' => [],
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]
            );
        });
    }
}
