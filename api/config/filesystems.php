<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        /*
         * Private storage (not web-accessible). Use for sensitive or internal files.
         * Default disk when FILESYSTEM_DISK is not set.
         */
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        /*
         * Web-accessible storage. Run: php artisan storage:link
         * Use this disk for uploads that must be served via URL (e.g. hero sliders, popup images).
         * Same pattern as laravel/popups: AsFile cast with disk 'public' for web-facing images.
         */
        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        /*
         * S3-compatible disk (AWS S3 or Backblaze B2 via AWS_ENDPOINT).
         * Public URL base defaults to https://cdn.tapeya.com. Admin setting
         * cdn_public_base_url overrides at boot via MediaCdn (not AWS_URL).
         *
         * Object Ownership must be BucketOwnerEnforced (no object ACLs). Public read is via CDN /
         * bucket policy. Always write through App\Support\Media\MediaDisk — never storePublicly()
         * or visibility=public. See docs/MEDIA_CDN_MIGRATION.md.
         */
        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => 'https://cdn.tapeya.com',
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => true,
            'report' => true,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Media / public assets disk
    |--------------------------------------------------------------------------
    |
    | Use 'public' for local storage, or 's3' for B2/S3 with Cloudflare CDN
    | (cdn_public_base_url / default https://cdn.tapeya.com). See docs/MEDIA_CDN_MIGRATION.md.
    |
    */
    'media_disk' => env('MEDIA_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
