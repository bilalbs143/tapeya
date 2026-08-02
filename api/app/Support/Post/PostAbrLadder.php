<?php

namespace App\Support\Post;

/**
 * Pure helpers for ABR ladder selection (unit-tested without ffmpeg).
 */
final class PostAbrLadder
{
    /**
     * @param  list<array{height: int, bandwidth?: int, maxrate?: string, bufsize?: string, audio_bitrate?: string, crf?: int}>  $ladder
     * @return list<array{height: int, bandwidth: int, maxrate: string, bufsize: string, audio_bitrate: string, crf: int}>
     */
    public static function rungsForSource(array $ladder, ?int $sourceHeight): array
    {
        $sourceHeight = $sourceHeight && $sourceHeight > 0 ? $sourceHeight : 720;
        $out = [];

        foreach ($ladder as $rung) {
            $height = (int) ($rung['height'] ?? 0);
            if ($height < 144) {
                continue;
            }
            // Skip rungs taller than the source (no upscale).
            if ($height > $sourceHeight + 16) {
                continue;
            }
            $maxrate = (string) ($rung['maxrate'] ?? '2500k');
            $audioBitrate = (string) ($rung['audio_bitrate'] ?? '128k');
            $out[] = [
                'height' => $height,
                'crf' => (int) ($rung['crf'] ?? 23),
                'maxrate' => $maxrate,
                'bufsize' => (string) ($rung['bufsize'] ?? '5000k'),
                'audio_bitrate' => $audioBitrate,
                'bandwidth' => isset($rung['bandwidth'])
                    ? (int) $rung['bandwidth']
                    : self::estimateBandwidth($maxrate, $audioBitrate),
            ];
        }

        if ($out === []) {
            $out[] = [
                'height' => min(720, $sourceHeight),
                'crf' => 23,
                'maxrate' => '2500k',
                'bufsize' => '5000k',
                'audio_bitrate' => '128k',
                'bandwidth' => self::estimateBandwidth('2500k', '128k'),
            ];
        }

        return $out;
    }

    /**
     * Estimate HLS BANDWIDTH from video maxrate + audio + ~10% mux overhead.
     */
    public static function estimateBandwidth(string $videoMaxrate, string $audioBitrate): int
    {
        $video = self::bitrateToInt($videoMaxrate);
        $audio = self::bitrateToInt($audioBitrate);

        return (int) max(100_000, (int) round(($video + $audio) * 1.10));
    }

    public static function bitrateToInt(string $rate): int
    {
        $rate = strtolower(trim($rate));
        if (preg_match('/^(\d+(?:\.\d+)?)k$/', $rate, $m)) {
            return (int) round(((float) $m[1]) * 1000);
        }
        if (preg_match('/^(\d+(?:\.\d+)?)m$/', $rate, $m)) {
            return (int) round(((float) $m[1]) * 1_000_000);
        }
        if (ctype_digit($rate)) {
            return (int) $rate;
        }

        return 2_500_000;
    }

    /**
     * @param  list<array{height: int, bandwidth: int, width?: int|null, playlist: string}>  $variants
     */
    public static function masterPlaylist(array $variants): string
    {
        $lines = ['#EXTM3U', '#EXT-X-VERSION:3'];
        foreach ($variants as $variant) {
            $height = (int) $variant['height'];
            $width = (int) ($variant['width'] ?? max(1, (int) round($height * 9 / 16)));
            $bandwidth = (int) $variant['bandwidth'];
            $playlist = ltrim((string) $variant['playlist'], '/');
            $lines[] = "#EXT-X-STREAM-INF:BANDWIDTH={$bandwidth},RESOLUTION={$width}x{$height}";
            $lines[] = $playlist;
        }

        return implode("\n", $lines)."\n";
    }
}
