<?php

namespace App\Console\Commands;

use App\Support\Broadcast\GraphicCommandManifestBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExportGraphicCommandManifest extends Command
{
    protected $signature = 'graphics:export-manifest
                            {--output= : Output path relative to repo root (default: shared/graphics-command-manifest.json)}';

    protected $description = 'Export the graphics command manifest from GraphicCommandKeyEnum.';

    public function handle(): int
    {
        $relativePath = $this->option('output') ?: 'shared/graphics-command-manifest.json';
        $manifestPath = base_path('../'.$relativePath);

        // ── 1. Write JSON manifest ────────────────────────────────────────────
        $manifest = GraphicCommandManifestBuilder::build();
        $json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            $this->error('Failed to encode manifest as JSON.');

            return self::FAILURE;
        }

        File::ensureDirectoryExists(dirname($manifestPath));
        File::put($manifestPath, $json.PHP_EOL);

        $commandCount = count($manifest['commands']);
        $this->info("Exported {$commandCount} command(s) → {$manifestPath}");

        // ── 2. Write JS constants file ────────────────────────────────────────
        $jsPath = base_path('../app/src/graphics/core/graphicCommandKeys.js');
        $js = GraphicCommandManifestBuilder::buildJsConstants();

        File::ensureDirectoryExists(dirname($jsPath));
        File::put($jsPath, $js.PHP_EOL);

        $this->info("Exported JS constants → {$jsPath}");

        return self::SUCCESS;
    }
}
