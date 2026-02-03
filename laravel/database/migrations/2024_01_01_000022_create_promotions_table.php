<?php

use App\Enums\Common\StatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->index();
            $table->string('status')->default(StatusEnum::ACTIVE->value)->index();
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_to')->nullable();
            $table->boolean('is_stackable')->default(false)->index();
            $table->boolean('is_visible')->default(true)->index();
            $table->string('image')->nullable();
            $table->jsonb('game_scope')->default(new Expression("'{}'::jsonb"));
            $table->jsonb('config')->default(new Expression("'{}'::jsonb"));
            $table->auditFields();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
