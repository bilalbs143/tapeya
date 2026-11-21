<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Combined auto-like digests need others_clause + content_type in the push body.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('push_notification_templates')) {
            return;
        }

        DB::table('push_notification_templates')
            ->where('key', 'post_liked')
            ->update([
                'body_template' => '{{actor_name}}{{others_clause}} liked your {{content_type}}',
                'available_variables' => json_encode([
                    'actor_name',
                    'others_clause',
                    'others_count',
                    'content_type',
                    'post_id',
                    'deep_link',
                    'actor_id',
                ]),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('push_notification_templates')) {
            return;
        }

        DB::table('push_notification_templates')
            ->where('key', 'post_liked')
            ->update([
                'body_template' => '{{actor_name}} liked your post',
                'available_variables' => json_encode([
                    'actor_name',
                    'post_id',
                    'deep_link',
                    'actor_id',
                ]),
                'updated_at' => now(),
            ]);
    }
};
