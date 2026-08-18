<?php

use App\Enums\User\UserStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('nickname', 50)->nullable()->unique();
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('type')->default('user');
            $table->string('phone', 30)->nullable()->unique();
            $table->string('status', 30)->nullable()->default(UserStatusEnum::VERIFICATION_PENDING->value);
            $table->string('active_platform', 20)->nullable();
            $table->timestamp('active_platform_updated_at')->nullable();
            $table->boolean('can_broadcast')->default(false);
            $table->timestamp('broadcast_terms_accepted_at')->nullable();
            $table->boolean('is_official')->default(false);
            $table->unsignedInteger('followers_count')->default(0);
            $table->unsignedInteger('reels_count')->default(0);
            $table->unsignedInteger('posts_count')->default(0);
            $table->unsignedInteger('following_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('referred_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date_of_birth')->nullable();
            $table->string('playing_role', 30)->nullable();
            $table->string('bowling_style', 50)->nullable();
            $table->string('batting_style', 50)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('added_via_quick_match')->default(false);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
