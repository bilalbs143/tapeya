<?php

namespace Database\Seeders;

use App\Models\GraphicTheme;
use Illuminate\Database\Seeder;

class GraphicThemeSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'teams' => [
                'home' => ['text_color' => '#ffffff', 'bg_color' => '#0d3320'],
                'away' => ['text_color' => '#ffffff', 'bg_color' => '#4a0e0e'],
            ],
            'enable_images' => false,
        ];

        GraphicTheme::query()->updateOrCreate(
            ['slug' => 'tapeya-basic-static'],
            [
                'name' => 'Tapeya Basic Static',
                'config_schema' => null,
                'default_config' => $defaults,
                'graphics_url_template' => null,
                'is_active' => true,
            ]
        );

        GraphicTheme::query()->updateOrCreate(
            ['slug' => 'tapeya-pro-static'],
            [
                'name' => 'Tapeya Pro Static',
                'config_schema' => null,
                'default_config' => $defaults,
                'graphics_url_template' => null,
                'is_active' => true,
            ]
        );
    }
}
