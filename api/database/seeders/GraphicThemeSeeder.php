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

        GraphicTheme::query()->create([
            'slug' => 'theme1',
            'name' => 'Midnight Neon Premium Theme',
            'config_schema' => null,
            'default_config' => [
                'teams' => [
                    'home' => ['text_color' => '#ffffff', 'bg_color' => '#1e3a5f'],
                    'away' => ['text_color' => '#ffffff', 'bg_color' => '#5c3d1e'],
                ],
                'enable_images' => false,
            ],
            'is_active' => true,
        ]);
    }
}
