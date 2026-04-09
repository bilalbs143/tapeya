<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_graphic_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')
                ->unique()
                ->constrained('matches')
                ->cascadeOnDelete();
            $table->foreignId('graphic_theme_id')
                ->constrained('graphic_themes')
                ->restrictOnDelete();
            $table->json('config')->nullable();
            $table->json('context')->nullable();
            $table->unsignedBigInteger('active_command_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_graphic_sessions');
    }
};
