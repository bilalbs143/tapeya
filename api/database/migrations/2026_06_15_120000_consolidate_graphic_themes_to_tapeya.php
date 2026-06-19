<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $theme1Id = DB::table('graphic_themes')->where('slug', 'theme1')->value('id');

        if (! $theme1Id) {
            $theme1Id = DB::table('graphic_themes')->insertGetId([
                'slug' => 'theme1',
                'name' => 'Midnight Neon Premium Theme',
                'config_schema' => null,
                'default_config' => json_encode([
                    'teams' => [
                        'home' => ['text_color' => '#ffffff', 'bg_color' => '#1e3a5f'],
                        'away' => ['text_color' => '#ffffff', 'bg_color' => '#5c3d1e'],
                    ],
                    'enable_images' => false,
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $legacyIds = DB::table('graphic_themes')
            ->whereIn('slug', ['theme-1', 'theme-2', 'tapeya-broadcast-static', 'tapeya'])
            ->pluck('id');

        if ($legacyIds->isNotEmpty()) {
            DB::table('match_graphic_sessions')
                ->whereIn('graphic_theme_id', $legacyIds)
                ->update(['graphic_theme_id' => $theme1Id]);

            DB::table('graphic_themes')->whereIn('id', $legacyIds)->delete();
        }
    }

    public function down(): void
    {
        // Legacy themes are intentionally removed.
    }
};
