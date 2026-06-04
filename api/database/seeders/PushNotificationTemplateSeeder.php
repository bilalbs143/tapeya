<?php

namespace Database\Seeders;

use App\Models\PushNotificationTemplate;
use Illuminate\Database\Seeder;

class PushNotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'key' => 'order_placed',
                'name' => 'Order Placed',
                'title_template' => 'Order Placed',
                'body_template' => 'Your order #{{order_number}} has been placed. Total: {{currency}} {{total}}',
                'available_variables' => ['order_number', 'currency', 'total', 'order_id'],
            ],
            [
                'key' => 'order_status_updated',
                'name' => 'Order Status Updated',
                'title_template' => 'Order Updated',
                'body_template' => 'Your order #{{order_number}} status is now: {{status}}',
                'available_variables' => ['order_number', 'status', 'order_id'],
            ],
            [
                'key' => 'order_delivered',
                'name' => 'Order Delivered',
                'title_template' => 'Order Delivered',
                'body_template' => 'Your order #{{order_number}} has been delivered!',
                'available_variables' => ['order_number', 'order_id'],
            ],
            [
                'key' => 'manual_broadcast',
                'name' => 'Manual Broadcast',
                'title_template' => '{{title}}',
                'body_template' => '{{body}}',
                'available_variables' => ['title', 'body'],
            ],
        ];

        foreach ($templates as $template) {
            PushNotificationTemplate::query()->updateOrCreate(
                ['key' => $template['key']],
                [
                    'name' => $template['name'],
                    'title_template' => $template['title_template'],
                    'body_template' => $template['body_template'],
                    'available_variables' => $template['available_variables'],
                    'is_active' => true,
                ]
            );
        }
    }
}
