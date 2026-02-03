<?php

use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Promotion::class)->index()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->index()->constrained()->cascadeOnDelete();
            $table->string('state')->default(PromotionProgressStateEnum::ELIGIBLE->value)->index();
            $table->double('turnover')->default(0);
            $table->double('net_win_loss')->default(0);
            $table->jsonb('meta')->default(new Expression("'{}'::jsonb"));
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('forfeited_at')->nullable();
            $table->string('reason')->nullable();
            $table->unique(['promotion_id', 'user_id']);
            $table->auditFields();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_progress');
    }
};
