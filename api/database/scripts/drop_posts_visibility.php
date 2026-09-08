<?php

/**
 * One-off schema cleanup for existing databases:
 *   Drop posts.visibility (posts are public for everyone; public/followers/private removed)
 *
 * Fresh installs: create_posts_table already omits the column — no action needed.
 *
 * Run from api/:
 *   php artisan tinker
 *   >>> require database/scripts/drop_posts_visibility.php;
 *
 * Or non-interactive:
 *   php artisan tinker --execute="require 'database/scripts/drop_posts_visibility.php';"
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

if (! Schema::hasTable('posts')) {
    echo "posts table missing — nothing to do.\n";

    return;
}

if (! Schema::hasColumn('posts', 'visibility')) {
    echo "posts.visibility already absent.\n";

    return;
}

$indexName = 'posts_visibility_status_published_at_index';
$sm = Schema::getConnection()->getSchemaBuilder();
$indexes = method_exists($sm, 'getIndexes')
    ? collect($sm->getIndexes('posts'))->pluck('name')->all()
    : [];

$hasIndex = in_array($indexName, $indexes, true);
if (! $hasIndex) {
    try {
        $hasIndex = collect(DB::select('SHOW INDEX FROM posts WHERE Key_name = ?', [$indexName]))->isNotEmpty();
    } catch (Throwable) {
        $hasIndex = false;
    }
}

Schema::table('posts', function (Blueprint $table) use ($indexName, $hasIndex) {
    if ($hasIndex) {
        $table->dropIndex($indexName);
    }
    $table->dropColumn('visibility');
});

echo $hasIndex
    ? "Dropped index {$indexName} and posts.visibility.\n"
    : "Dropped posts.visibility (index already absent).\n";
