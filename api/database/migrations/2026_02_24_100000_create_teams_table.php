<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->string('code', 20)->unique();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            // Free-text display fields (comma-separated when multiple). Not users FKs.
            $table->string('sponsor', 500)->nullable();
            $table->string('icon_players', 500)->nullable();
            // Managing owner (capability).
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
