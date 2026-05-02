<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('graphic_themes')
            ->where('slug', 'tapeya-basic-static')
            ->update([
                'slug' => 'tapeya-basic',
                'name' => 'Tapeya Basic',
                'updated_at' => now(),
            ]);

        $basicId = DB::table('graphic_themes')->where('slug', 'tapeya-basic')->value('id');
        $proId = DB::table('graphic_themes')->where('slug', 'tapeya-pro-static')->value('id');

        if ($proId && $basicId) {
            DB::table('match_graphic_sessions')
                ->where('graphic_theme_id', $proId)
                ->update(['graphic_theme_id' => $basicId, 'updated_at' => now()]);

            DB::table('graphic_themes')->where('id', $proId)->delete();
        }
    }

    public function down(): void
    {
        DB::table('graphic_themes')
            ->where('slug', 'tapeya-basic')
            ->update([
                'slug' => 'tapeya-basic-static',
                'name' => 'Tapeya Basic Static',
                'updated_at' => now(),
            ]);

        // Does not re-insert tapeya-pro-static; run GraphicThemeSeeder to restore.
    }
};
