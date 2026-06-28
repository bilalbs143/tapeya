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
            'config_schema' => [
                'properties' => [
                    [
                        'key' => 'homeBgColor',
                        'label' => 'Home Team Color',
                        'type' => 'color',
                        'default' => '#1e3a5f',
                    ],
                    [
                        'key' => 'awayBgColor',
                        'label' => 'Away Team Color',
                        'type' => 'color',
                        'default' => '#5c3d1e',
                    ],
                    [
                        'key' => 'enableImages',
                        'label' => 'Show Player Images',
                        'type' => 'boolean',
                        'default' => false,
                    ],
                ],
            ],
            'default_config' => [
                'homeBgColor' => '#1e3a5f',
                'awayBgColor' => '#5c3d1e',
                'enableImages' => false,
            ],
            'is_active' => true,
        ]);
    }
}
