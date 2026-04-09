<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_graphic_captions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_graphic_session_id')
                ->unique()
                ->constrained('match_graphic_sessions')
                ->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_graphic_captions');
    }
};
