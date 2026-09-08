<?php

namespace Tests\Unit\Http;

use App\Http\ApiErrorCatalog;
use App\Settings\PostsSettings;
use Tests\TestCase;

class ReelUploadProductionGuardsTest extends TestCase
{
    public function test_upload_failed_maps_to_service_unavailable_status(): void
    {
        $this->assertSame(503, ApiErrorCatalog::statusForType('UPLOAD_FAILED'));
    }

    public function test_multipart_part_size_floors_at_five_megabytes(): void
    {
        $settings = app(PostsSettings::class);
        $original = $settings->multipartPartSizeMb;

        try {
            $settings->multipartPartSizeMb = 1;
            $settings->save();

            $this->assertSame(5 * 1024 * 1024, app(PostsSettings::class)->multipartPartSizeBytes());
        } finally {
            $settings->multipartPartSizeMb = $original;
            $settings->save();
        }
    }
}
