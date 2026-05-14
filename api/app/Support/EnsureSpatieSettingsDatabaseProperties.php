<?php

namespace App\Support;

use App\Settings\GeneralSettings;
use App\Settings\OverlaySettings;
use ReflectionProperty;
use Spatie\LaravelSettings\Settings;
use Spatie\LaravelSettings\SettingsConfig;
use Spatie\LaravelSettings\Support\Crypto;

final class EnsureSpatieSettingsDatabaseProperties
{
    public static function ensure(): void
    {
        foreach (config('settings.settings', []) as $settingsClass) {
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
                if ($settingsClass === OverlaySettings::class && $name === 'defaultTtlSeconds') {
                    return 86400;
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
                    default => '',
                };
            }
        }

        return null;
    }
}
