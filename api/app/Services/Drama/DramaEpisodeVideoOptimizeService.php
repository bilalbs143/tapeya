<?php

namespace App\Services\Drama;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Models\DramaEpisode;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

/**
 * Remux uploaded episode MP4s with {@code -movflags +faststart} so the moov atom is at the
 * front of the file. Without this, mobile players often buffer for a long time (or until most
 * of the file downloads) before the first frame appears.
 *
 * Stream-copy only — no re-encode. Keeps progressive MP4 delivery (no HLS ladder).
 */
class DramaEpisodeVideoOptimizeService
{
    public function optimize(DramaEpisode $episode): bool
    {
        if ($episode->video_source !== DramaVideoSourceEnum::UPLOAD) {
            return false;
        }

        $path = $episode->getRawOriginal('video');
        if (! $path || ! MediaDisk::exists($path)) {
            return false;
        }

        $tmpDir = storage_path('app/tmp/drama-episodes/'.$episode->id);
        if (! is_dir($tmpDir) && ! mkdir($tmpDir, 0755, true) && ! is_dir($tmpDir)) {
            throw new \RuntimeException('Could not create temp directory for episode video optimize.');
        }

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION) ?: 'mp4');
        $localInput = $tmpDir.'/original.'.$extension;
        $localOutput = $tmpDir.'/faststart.mp4';

        try {
            file_put_contents($localInput, MediaDisk::disk()->get($path));

            $this->remuxFaststart($localInput, $localOutput);

            if (! is_file($localOutput) || filesize($localOutput) < 1) {
                throw new \RuntimeException('Faststart remux produced an empty file.');
            }

            $dir = trim(dirname($path), '.');
            $newPath = ($dir !== '' ? $dir.'/' : '').Str::uuid().'.mp4';

            MediaDisk::put($newPath, file_get_contents($localOutput), [
                'ContentType' => 'video/mp4',
            ]);

            $episode->update(['video' => $newPath]);
            MediaDisk::delete($path);

            Log::info('Drama episode video optimized for progressive playback', [
                'episode_id' => $episode->id,
                'from' => $path,
                'to' => $newPath,
            ]);

            return true;
        } finally {
            $this->cleanupDir($tmpDir);
        }
    }

    private function remuxFaststart(string $input, string $output): void
    {
        $ffmpeg = config('posts.ffmpeg_path', 'ffmpeg');

        $process = new Process([
            $ffmpeg,
            '-y',
            '-i', $input,
            '-c', 'copy',
            '-movflags', '+faststart',
            $output,
        ]);
        $process->setTimeout(600);
        $process->run();

        if ($process->isSuccessful() && is_file($output) && filesize($output) > 0) {
            return;
        }

        // Remux-only can fail on odd containers; fall back to a light H.264/AAC re-encode.
        Log::warning('Drama episode faststart remux failed; falling back to re-encode', [
            'error' => $process->getErrorOutput(),
        ]);

        $reencode = new Process([
            $ffmpeg,
            '-y',
            '-i', $input,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-profile:v', 'main',
            '-level', '4.0',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ac', '2',
            '-ar', '48000',
            '-movflags', '+faststart',
            $output,
        ]);
        $reencode->setTimeout(1800);
        $reencode->run();

        if (! $reencode->isSuccessful() || ! is_file($output) || filesize($output) < 1) {
            throw new \RuntimeException('ffmpeg faststart optimize failed: '.$reencode->getErrorOutput());
        }
    }

    private function cleanupDir(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (glob($dir.'/*') ?: [] as $file) {
            if (is_file($file)) {
                @unlink($file);
            }
        }
        @rmdir($dir);
    }
}
