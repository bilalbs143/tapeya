<?php

namespace Database\Seeders;

use App\Models\GraphicTheme;
use Illuminate\Database\Seeder;

class GraphicThemeSeeder extends Seeder
{
    public function run(): void
    {
        GraphicTheme::updateOrCreate(
            ['slug' => 'theme1'],
            [
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
            ]
        );

        GraphicTheme::updateOrCreate(
            ['slug' => 'theme2'],
            [
                'name' => 'Crimson Gold Premium Theme',
                'config_schema' => [
                    'properties' => [
                        [
                            'key' => 'homeBgColor',
                            'label' => 'Home Team Color',
                            'type' => 'color',
                            'default' => '#2e0a1a',
                        ],
                        [
                            'key' => 'awayBgColor',
                            'label' => 'Away Team Color',
                            'type' => 'color',
                            'default' => '#9c0028',
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
                    'homeBgColor' => '#2e0a1a',
                    'awayBgColor' => '#9c0028',
                    'enableImages' => false,
                ],
                'is_active' => true,
            ]
        );
    }
}
