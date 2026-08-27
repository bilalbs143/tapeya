<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_sliders', function (Blueprint $table) {
            $table->string('cta_type', 20)->default('none')->after('status');
            $table->string('cta_label', 255)->nullable()->after('cta_type');
            $table->string('cta_url', 2048)->nullable()->after('cta_label');
            $table->boolean('cta_target_blank')->default(true)->after('cta_url');
            $table->string('cta_dialog_key', 64)->nullable()->after('cta_target_blank');
            $table->string('cta_dialog_param', 255)->nullable()->after('cta_dialog_key');
        });

        DB::table('hero_sliders')
            ->whereNotNull('cta_url')
            ->where('cta_url', '!=', '')
            ->update(['cta_type' => 'url']);
    }

    public function down(): void
    {
        Schema::table('hero_sliders', function (Blueprint $table) {
            $table->dropColumn([
                'cta_type',
                'cta_label',
                'cta_url',
                'cta_target_blank',
                'cta_dialog_key',
                'cta_dialog_param',
            ]);
        });
    }
};
