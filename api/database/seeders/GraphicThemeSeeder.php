<?php

namespace Database\Seeders;

use App\Models\GraphicTheme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GraphicThemeSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        try {
            DB::table('match_graphic_commands')->truncate();
            DB::table('match_graphic_sessions')->truncate();
            DB::table('graphic_themes')->truncate();
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        $defaults = [
            'teams' => [
                'home' => ['text_color' => '#ffffff', 'bg_color' => '#0d3320'],
                'away' => ['text_color' => '#ffffff', 'bg_color' => '#4a0e0e'],
            ],
            'enable_images' => false,
        ];

        GraphicTheme::query()->create([
            'slug' => 'tapeya-basic',
            'name' => 'Tapeya Basic',
            'config_schema' => null,
            'default_config' => $defaults,
            'graphics_url_template' => null,
            'is_active' => true,
        ]);

        $broadcastDefaults = [
            'teams' => [
                'home' => ['text_color' => '#ffffff', 'bg_color' => '#1e3a5f'],
                'away' => ['text_color' => '#ffffff', 'bg_color' => '#5c3d1e'],
            ],
            'enable_images' => false,
        ];

        GraphicTheme::query()->create([
            'slug' => 'tapeya-broadcast-static',
            'name' => 'Tapeya Broadcast Static',
            'config_schema' => null,
            'default_config' => $broadcastDefaults,
            'graphics_url_template' => null,
            'is_active' => true,
        ]);
    }
}
