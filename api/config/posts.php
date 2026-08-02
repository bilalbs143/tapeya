<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Transcode output (infra defaults — not env / not system settings)
    |--------------------------------------------------------------------------
    */

    'output' => [
        'video_codec' => 'libx264',
        'audio_codec' => 'aac',
        'height' => 720,
        'crf' => 23,
        'maxrate' => '2500k',
        'bufsize' => '5000k',
        'audio_bitrate' => '128k',
        'preset' => 'medium',
    ],

    /*
    |--------------------------------------------------------------------------
    | ABR ladder (lowest first — first HLS rung marks the post ready)
    |--------------------------------------------------------------------------
    |
    | Delivery is HLS-only (progressive MP4 is not uploaded). Ladder drives
    | local encode bitrates then HLS packaging. 480p floor stays readable on
    | phones; 720p is the HD step-up. Taller-than-source rungs are skipped.
    |
    */

    'ladder' => [
        [
            'height' => 480,
            'crf' => 24,
            'maxrate' => '1200k',
            'bufsize' => '2400k',
            'audio_bitrate' => '96k',
        ],
        [
            'height' => 720,
            'crf' => 23,
            'maxrate' => '2500k',
            'bufsize' => '5000k',
            'audio_bitrate' => '128k',
        ],
    ],

    /** Queue worker wall-clock budget for the full ABR ladder (seconds). */
    'transcode_timeout_seconds' => 1800,

    /*
    |--------------------------------------------------------------------------
    | Queues (worker program names — infra)
    |--------------------------------------------------------------------------
    |
    | - reels-poster: fast thumbnail extraction (many short jobs)
    | - reels-transcode: FFmpeg ABR (CPU-heavy; keep concurrency low)
    | - reels: cleanup originals / media snapshots (must not share encode workers)
    |
    */

    'queues' => [
        'default' => 'reels',
        'poster' => 'reels-poster',
        'transcode' => 'reels-transcode',
    ],

    /*
    |--------------------------------------------------------------------------
    | FFmpeg binaries (must be on PATH of worker hosts)
    |--------------------------------------------------------------------------
    */

    'ffmpeg_path' => env('FFMPEG_PATH', 'ffmpeg'),
    'ffprobe_path' => env('FFPROBE_PATH', 'ffprobe'),

    /*
    |--------------------------------------------------------------------------
    | Poster extraction (WebP via libwebp)
    |--------------------------------------------------------------------------
    */

    'poster' => [
        'cropdetect' => true,
        'edge_trim_px' => 2,
    ],

];
