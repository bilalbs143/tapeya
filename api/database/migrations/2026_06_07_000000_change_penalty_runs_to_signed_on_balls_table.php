<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * penalty_runs was unsignedTinyInteger (0–255). Changing to smallInteger
 * so deductions (negative values) can be stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->smallInteger('penalty_runs')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->unsignedTinyInteger('penalty_runs')->default(0)->change();
        });
    }
};
