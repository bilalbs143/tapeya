<?php

/**
 * One-off schema cleanup for existing databases:
 *   1) Drop users.referred_by (referral product removed)
 *   2) Drop unique index on users.nickname (nicknames may repeat)
 *
 * Fresh installs: create_users_table already matches — no action needed.
 *
 * Run from api/:
 *   php artisan tinker
 *   >>> require database/scripts/drop_users_referred_by.php;
 *
 * Or non-interactive:
 *   php artisan tinker --execute="require 'database/scripts/drop_users_referred_by.php';"
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

if (! Schema::hasTable('users')) {
    echo "users table missing — nothing to do.\n";

    return;
}

if (! Schema::hasColumn('users', 'referred_by')) {
    echo "users.referred_by already absent.\n";
} else {
    Schema::table('users', function (Blueprint $table) {
        $table->dropConstrainedForeignId('referred_by');
    });
    echo "Dropped users.referred_by (FK + column).\n";
}

$nicknameUniqueIndex = 'users_nickname_unique';
$sm = Schema::getConnection()->getSchemaBuilder();
$indexes = method_exists($sm, 'getIndexes')
    ? collect($sm->getIndexes('users'))->pluck('name')->all()
    : [];

$hasNicknameUnique = in_array($nicknameUniqueIndex, $indexes, true);
if (! $hasNicknameUnique) {
    // Fallback for drivers / Laravel versions without getIndexes detail.
    try {
        $hasNicknameUnique = collect(DB::select('SHOW INDEX FROM users WHERE Key_name = ?', [$nicknameUniqueIndex]))->isNotEmpty();
    } catch (Throwable) {
        $hasNicknameUnique = false;
    }
}

if (! $hasNicknameUnique) {
    echo "users.nickname unique index already absent.\n";
} else {
    Schema::table('users', function (Blueprint $table) use ($nicknameUniqueIndex) {
        $table->dropUnique($nicknameUniqueIndex);
    });
    echo "Dropped unique index {$nicknameUniqueIndex}.\n";
}

// Retire leftover push template (same key the seeder deletes).
if (Schema::hasTable('push_notification_templates')) {
    $deleted = DB::table('push_notification_templates')->where('key', 'user_referred')->delete();
    echo $deleted > 0
        ? "Deleted push_notification_templates key=user_referred ({$deleted}).\n"
        : "push_notification_templates key=user_referred already absent.\n";
}
