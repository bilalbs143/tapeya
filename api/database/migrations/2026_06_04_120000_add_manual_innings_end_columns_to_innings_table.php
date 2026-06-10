<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('innings', function (Blueprint $table) {
            $table->string('end_reason', 50)->nullable()->after('status');
            $table->string('ended_by', 20)->nullable()->after('end_reason');
            $table->text('end_comments')->nullable()->after('ended_by');
            $table->boolean('points_awarded_each')->default(false)->after('end_comments');
        });
    }

    public function down(): void
    {
        Schema::table('innings', function (Blueprint $table) {
            $table->dropColumn(['end_reason', 'ended_by', 'end_comments', 'points_awarded_each']);
        });
    }
};
