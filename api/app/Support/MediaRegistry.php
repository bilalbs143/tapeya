<?php

namespace App\Support;

use App\Models\HeroSlider;
use App\Models\Highlight;
use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentInterestCampaign;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Registry that maps media type slugs to their Eloquent model and field config.
 *
 * Single-file field config keys:
 *   'dir'    — storage subdirectory
 *   'column' — model column that holds the relative path
 *
 * Multiple-file field config keys (set 'multiple' => true):
 *   'dir'               — storage subdirectory
 *   'relation'          — hasMany relation name on the owning model
 *   'relation_path_col' — column on the related model that stores the path
 */
class MediaRegistry
{
    /**
     * @return array<string, array{model: class-string<Model>, fields: array<string, array<string, mixed>>}>
     */
    public static function types(): array
    {
        return [
            'brand' => [
                'model' => Brand::class,
                'fields' => [
                    'logo' => ['dir' => 'shop/brands', 'column' => 'logo'],
                ],
            ],
            'category' => [
                'model' => Category::class,
                'fields' => [
                    'image' => ['dir' => 'shop/categories', 'column' => 'image'],
                ],
            ],
            'hero-slider' => [
                'model' => HeroSlider::class,
                'fields' => [
                    'image_mobile' => ['dir' => 'hero-sliders', 'column' => 'image_mobile'],
                    'image_desktop' => ['dir' => 'hero-sliders', 'column' => 'image_desktop'],
                ],
            ],
            'tournament' => [
                'model' => Tournament::class,
                'fields' => [
                    'display_image' => ['dir' => 'tournaments', 'column' => 'display_image'],
                    'cover_image' => ['dir' => 'tournaments', 'column' => 'cover_image'],
                ],
            ],
            'team' => [
                'model' => Team::class,
                'fields' => [
                    'logo' => ['dir' => 'teams', 'column' => 'logo'],
                ],
            ],
            'campaign' => [
                'model' => TournamentInterestCampaign::class,
                'fields' => [
                    // Form field is "logo" but DB column is "logo_path"
                    'logo' => ['dir' => 'interest-campaigns/logos', 'column' => 'logo_path'],
                ],
            ],
            'match' => [
                'model' => TournamentMatch::class,
                'fields' => [
                    'thumbnail' => ['dir' => 'match-stream-thumbnails', 'column' => 'stream_thumbnail'],
                ],
            ],
            'highlight' => [
                'model' => Highlight::class,
                'fields' => [
                    'thumbnail' => ['dir' => 'highlights', 'column' => 'thumbnail'],
                    'video' => [
                        'dir' => 'highlights/videos',
                        'column' => 'video',
                        'file_rules' => [
                            'required',
                            'file',
                            'mimetypes:video/mp4,video/webm,video/quicktime',
                            'max:102400',
                        ],
                    ],
                ],
            ],
            'product' => [
                'model' => Product::class,
                'fields' => [
                    'images' => [
                        'dir' => 'shop/products',
                        'multiple' => true,
                        'relation' => 'images',
                        'relation_path_col' => 'path',
                    ],
                ],
            ],
            'user' => [
                'model' => User::class,
                'fields' => [
                    'avatar' => ['dir' => 'users/avatars', 'column' => 'avatar'],
                ],
            ],
        ];
    }

    /**
     * Resolve a type+id+field to an Eloquent record and its field config.
     *
     * @return array{0: Model, 1: array<string, mixed>}
     *
     * @throws \InvalidArgumentException for unknown type or field slug
     * @throws ModelNotFoundException if the record is missing
     */
    public static function resolve(string $type, int $id, string $field): array
    {
        $types = self::types();

        if (! array_key_exists($type, $types)) {
            throw new \InvalidArgumentException("Unknown media type: {$type}");
        }

        $typeConfig = $types[$type];

        if (! array_key_exists($field, $typeConfig['fields'])) {
            throw new \InvalidArgumentException("Unknown field '{$field}' for type '{$type}'.");
        }

        /** @var Model $record */
        $record = $typeConfig['model']::findOrFail($id);

        return [$record, $typeConfig['fields'][$field]];
    }
}
