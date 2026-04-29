<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * At most one broadcast staff user per tournament (unique tournament_id). No pivot sub-roles.
     */
    public function up(): void
    {
        Schema::create('tournament_broadcaster', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique('tournament_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_broadcaster');
    }
};
