<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->string('playing_role', 30)->nullable()->after('date_of_birth');
            $table->string('bowling_style', 50)->nullable()->after('playing_role');
            $table->string('batting_style', 50)->nullable()->after('bowling_style');
            $table->string('country', 100)->nullable()->after('batting_style');
            $table->string('city', 100)->nullable()->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'playing_role',
                'bowling_style',
                'batting_style',
                'country',
                'city',
            ]);
        });
    }
};
