<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_partner_id')->constrained('brand_partners')->cascadeOnDelete();
            $table->string('name');
            $table->string('status', 32)->default('draft');
            $table->string('objective', 32)->default('awareness');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->json('surfaces');
            $table->unsignedInteger('slot_every_n')->default(8);
            $table->unsignedInteger('max_ads_per_response')->default(1);
            $table->json('targeting_json')->nullable();
            $table->text('budget_notes')->nullable();
            $table->foreignId('created_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'starts_at', 'ends_at']);
            $table->index(['brand_partner_id', 'status']);
            $table->index('priority');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_campaigns');
    }
};
