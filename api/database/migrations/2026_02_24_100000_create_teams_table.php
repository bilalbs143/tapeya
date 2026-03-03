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

            // Sponsor who owns this team (app user).
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Who created the team (sponsor or organizer); nullable in case of backfill.
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
