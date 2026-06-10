<?php

namespace App\Models;

use Spatie\QueryBuilder\AllowedFilter;

class PushNotificationTemplate extends BaseModel
{
    protected $fillable = [
        'key',
        'name',
        'title_template',
        'body_template',
        'available_variables',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'available_variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('key'),
            AllowedFilter::exact('is_active'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'key', 'name', 'created_at', 'updated_at'];
    }

    /**
     * Sample values for admin live preview in the backoffice editor.
     *
     * @return array<string, string>
     */
    public function samplePreviewData(): array
    {
        return match ($this->key) {
            'order_placed' => [
                'order_number' => 'ORD-0042',
                'currency' => 'PKR',
                'total' => '1500',
                'order_id' => '123',
            ],
            'order_status_updated' => [
                'order_number' => 'ORD-0042',
                'status' => 'Dispatched',
                'order_id' => '123',
            ],
            'order_delivered' => [
                'order_number' => 'ORD-0042',
                'order_id' => '123',
            ],
            'manual_broadcast' => [
                'title' => 'Sample Title',
                'body' => 'Sample message body',
            ],
            default => [],
        };
    }
}
