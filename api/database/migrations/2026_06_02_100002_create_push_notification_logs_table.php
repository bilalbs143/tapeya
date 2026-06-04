<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('template_key', 100)->nullable();
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->string('image_url', 2048)->nullable();
            $table->string('target_type', 50);
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('triggered_by', 50);
            $table->foreignId('sent_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 50);
            $table->unsignedInteger('total_tokens')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failure_count')->default(0);
            $table->string('provider', 50)->default('fcm');
            $table->text('error_message')->nullable();
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('triggered_by');
            $table->index('target_type');
            $table->index('target_user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_notification_logs');
    }
};
