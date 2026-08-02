<?php

namespace App\Support;

use App\Settings\GeneralSettings;
use App\Settings\GraphicsSettings;
use App\Settings\LiveChatSettings;
use App\Settings\PostsSettings;
use App\Settings\PushSettings;
use App\Settings\StreamingSettings;
use ReflectionProperty;
use Spatie\LaravelSettings\Settings;
use Spatie\LaravelSettings\SettingsConfig;
use Spatie\LaravelSettings\Support\Crypto;

final class EnsureSpatieSettingsDatabaseProperties
{
    public static function ensure(): void
    {
        foreach (self::settingsClasses() as $settingsClass) {
            if (! is_string($settingsClass) || ! is_subclass_of($settingsClass, Settings::class)) {
                continue;
            }

            $config = new SettingsConfig($settingsClass);
            $repository = $config->getRepository();
            $group = $config->getGroup();

            foreach ($config->getReflectedProperties() as $name => $property) {
                if ($repository->checkIfPropertyExists($group, $name)) {
                    continue;
                }

                $payload = self::initialPayload($settingsClass, $name, $property);

                if ($config->isEncrypted($name)) {
                    $payload = Crypto::encrypt($payload);
                }

                $repository->createProperty($group, $name, $payload);
            }
        }
    }

    private static function initialPayload(string $settingsClass, string $name, ReflectionProperty $property): mixed
    {
        $type = $property->getType();

        if ($type instanceof \ReflectionNamedType) {
            if ($type->getName() === 'array') {
                return [];
            }

            if ($type->getName() === 'int') {
                if ($settingsClass === GraphicsSettings::class && $name === 'defaultTtlSeconds') {
                    return 86400;
                }

                if ($settingsClass === LiveChatSettings::class) {
                    return match ($name) {
                        'enabled' => 1,
                        'minIntervalSec' => 2,
                        'burstMax' => 20,
                        'burstWindowSec' => 600,
                        'bodyMax' => 200,
                        default => 0,
                    };
                }

                if ($settingsClass === PushSettings::class) {
                    return match ($name) {
                        'enabled' => 0,
                        default => 0,
                    };
                }

                if ($settingsClass === StreamingSettings::class) {
                    return match ($name) {
                        'idleEndGraceMinutes' => 120,
                        'concurrentBroadcastAlertThreshold' => 3,
                        'dailyYoutubeQuotaBudget' => 10000,
                        'quotaAlertThresholdPercent' => 80,
                        default => 0,
                    };
                }

                if ($settingsClass === PostsSettings::class) {
                    return match ($name) {
                        'maxDurationSeconds' => 0,
                        'minDurationSeconds' => 0,
                        'maxUploadMb' => 0,
                        'hlsSegmentSeconds' => 2,
                        'viewMinWatchedMs' => 3000,
                        'viewMinCompletionRatePercent' => 25,
                        'viewAllowAnonymous' => 0,
                        'viewRedisBuffer' => 1,
                        'multipartPartSizeMb' => 1,
                        'multipartMaxParts' => 0,
                        default => 0,
                    };
                }

                return 0;
            }

            if ($type->getName() === 'string' && ! $type->allowsNull()) {
                return match ($settingsClass) {
                    GeneralSettings::class => match ($name) {
                        'currency' => 'PKR',
                        'timezone' => 'Asia/Karachi',
                        default => '',
                    },
                    StreamingSettings::class => match ($name) {
                        'defaultProvider' => 'youtube',
                        default => '',
                    },
                    PushSettings::class => match ($name) {
                        'provider' => 'fcm',
                        default => '',
                    },
                    default => '',
                };
            }
        }

        return null;
    }

    /**
     * Registered Settings classes. Merges runtime config with settings.php so a stale
     * config cache cannot skip newly added groups (e.g. PushSettings).
     *
     * @return list<class-string<Settings>>
     */
    private static function settingsClasses(): array
    {
        $fromConfig = config('settings.settings', []);
        $fromFile = require config_path('settings.php');
        $fromFile = is_array($fromFile['settings'] ?? null) ? $fromFile['settings'] : [];

        return array_values(array_unique([...$fromConfig, ...$fromFile], SORT_REGULAR));
    }
}
