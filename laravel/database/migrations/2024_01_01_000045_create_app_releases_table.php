<?php

use App\Enums\AppRelease\AppOsEnum;
use App\Enums\AppRelease\AppReleaseChannelEnum;
use App\Enums\AppRelease\AppTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_releases', function (Blueprint $table) {
            $table->id();
            $table->integer('major_version')->index();
            $table->integer('minor_version')->index();
            $table->integer('patch_version')->index();
            $table->string('version');
            $table->string('file_path');
            $table->string('file_name');
            $table->bigInteger('file_size')->nullable()->comment('Size in bytes');
            $table->string('file_hash')->nullable()->comment('SHA256 hash for verification');
            $table->string('mime_type')->default('application/vnd.android.package-archive');
            $table->string('os')->default(AppOsEnum::ANDROID->value)->index();
            $table->string('type')->default(AppTypeEnum::RELEASE->value)->index();
            $table->string('release_channel')->index()->default(AppReleaseChannelEnum::PRODUCTION->value);
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_forced')->default(false)->index()->comment('Force users to update');
            $table->boolean('is_critical')->default(false)->index()->comment('Critical security update');
            $table->text('release_notes')->nullable();
            $table->text('min_os_version')->nullable()->comment('Minimum OS version required');
            $table->text('supported_devices')->nullable()->comment('Device compatibility');
            $table->unsignedBigInteger('download_count')->default(0);
            $table->unsignedBigInteger('install_count')->default(0);
            $table->timestamp('released_at')->nullable()->index();
            $table->timestamp('disabled_at')->nullable()->index();
            $table->timestamp('last_downloaded_at')->nullable()->index();
            $table->auditFields();

            // Composite index for better query performance
            $table->index(['os', 'type', 'is_active']);
            $table->index(['major_version', 'minor_version', 'patch_version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_releases');
    }
};
