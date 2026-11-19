<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_creatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('ad_campaigns')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('posts')->restrictOnDelete();
            $table->string('name');
            $table->string('headline')->nullable();
            $table->string('cta_label');
            $table->string('cta_url', 2048);
            $table->string('cta_type', 32)->default('url');
            $table->string('disclosure_label')->default('Sponsored');
            $table->string('status', 32)->default('pending_review');
            $table->unsignedInteger('weight')->default(1);
            $table->foreignId('reviewed_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'status', 'post_id']);
            $table->index(['status', 'id']);
            $table->index('post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_creatives');
    }
};
