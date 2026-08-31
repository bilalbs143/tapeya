<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\Common\StatusEnum;
use App\Enums\Content\HeroSliderCtaTypeEnum;
use App\Utils\Traits\Model\BaseModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;

class HeroSlider extends Model
{
    use BaseModelTrait;

    protected $fillable = [
        'image_mobile',
        'image_desktop',
        'status',
        'cta_type',
        'cta_label',
        'cta_url',
        'cta_target_blank',
        'cta_dialog_key',
        'cta_dialog_param',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'image_mobile' => AsFile::class.':hero-sliders,false,media',
            'image_desktop' => AsFile::class.':hero-sliders,false,media',
            'status' => StatusEnum::class,
            'cta_type' => HeroSliderCtaTypeEnum::class,
            'cta_target_blank' => 'boolean',
        ];
    }

    /** Used by AsFile cast for store path. */
    public function kebab(): string
    {
        return Str::kebab(class_basename($this));
    }

    /**
     * @return array<int, string>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'status',
            'created_at',
            'updated_at',
        ];
    }
}
