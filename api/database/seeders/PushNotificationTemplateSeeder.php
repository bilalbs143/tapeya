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
                'available_variables' => ['order_number', 'currency', 'total', 'order_id', 'vendor_order_id', 'deep_link'],
            ],
            [
                'key' => 'order_status_updated',
                'name' => 'Order Status Updated',
                'title_template' => 'Order Updated',
                'body_template' => 'Your order #{{order_number}} status is now: {{status}}',
                'available_variables' => ['order_number', 'status', 'order_id', 'vendor_order_id', 'deep_link'],
            ],
            [
                'key' => 'order_delivered',
                'name' => 'Order Delivered',
                'title_template' => 'Order Delivered',
                'body_template' => 'Your order #{{order_number}} has been delivered!',
                'available_variables' => ['order_number', 'order_id', 'vendor_order_id', 'deep_link'],
            ],
            [
                'key' => 'manual_broadcast',
                'name' => 'Manual Broadcast',
                'title_template' => '{{title}}',
                'body_template' => '{{body}}',
                'available_variables' => ['title', 'body'],
            ],
            [
                'key' => 'post_liked',
                'name' => 'Post Liked',
                'title_template' => 'New Like',
                'body_template' => '{{actor_name}} liked your post',
                'available_variables' => ['actor_name', 'post_id', 'deep_link', 'actor_id'],
            ],
            [
                'key' => 'post_commented',
                'name' => 'Post Commented',
                'title_template' => 'New Comment',
                'body_template' => '{{actor_name}} commented on your post',
                'available_variables' => ['actor_name', 'post_id', 'comment_id', 'deep_link', 'actor_id'],
            ],
            [
                'key' => 'post_comment_reply',
                'name' => 'Post Comment Reply',
                'title_template' => 'New Reply',
                'body_template' => '{{actor_name}} replied to your comment',
                'available_variables' => ['actor_name', 'post_id', 'comment_id', 'parent_id', 'deep_link', 'actor_id'],
            ],
            [
                'key' => 'post_comment_liked',
                'name' => 'Post Comment Liked',
                'title_template' => 'New Like',
                'body_template' => '{{actor_name}} liked your comment',
                'available_variables' => ['actor_name', 'post_id', 'comment_id', 'deep_link', 'actor_id'],
            ],
            [
                'key' => 'post_mentioned',
                'name' => 'Post Mention',
                'title_template' => 'You Were Mentioned',
                'body_template' => '{{actor_name}} mentioned you in a {{mention_source}}',
                'available_variables' => ['actor_name', 'post_id', 'comment_id', 'deep_link', 'actor_id', 'mention_source'],
            ],
            [
                'key' => 'post_reposted',
                'name' => 'Post Reposted',
                'title_template' => 'New Repost',
                'body_template' => '{{actor_name}} reposted your post',
                'available_variables' => ['actor_name', 'post_id', 'deep_link', 'actor_id'],
            ],
            [
                'key' => 'post_published',
                'name' => 'Post Published',
                'title_template' => 'New Post',
                'body_template' => '{{actor_name}} posted something new',
                'available_variables' => ['actor_name', 'post_id', 'deep_link', 'actor_id'],
            ],
            [
                'key' => 'user_followed',
                'name' => 'User Followed',
                'title_template' => 'New Follower',
                'body_template' => '{{actor_name}} started following you',
                'available_variables' => ['actor_name', 'actor_id', 'deep_link'],
            ],
            [
                'key' => 'user_referred',
                'name' => 'User Referred',
                'title_template' => 'New Referral',
                'body_template' => '{{actor_name}} joined using your nickname',
                'available_variables' => ['actor_name', 'actor_id', 'deep_link'],
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

        // Retired keys — vendors share order_* templates; payment updates no longer notify vendors.
        PushNotificationTemplate::query()
            ->whereIn('key', ['vendor_order_placed', 'vendor_order_status_updated', 'order_payment_updated'])
            ->delete();
    }
}
