<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('graphic_themes', function (Blueprint $table) {
            $table->dropColumn('graphics_url_template');
        });
    }

    public function down(): void
    {
        Schema::table('graphic_themes', function (Blueprint $table) {
            $table->string('graphics_url_template')->nullable();
        });
    }
};
