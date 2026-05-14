<?php

namespace App\Services\Notifications;

use App\Contracts\Notifications\SmsDriverInterface;
use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Services\Notifications\Drivers\LogSmsDriver;
use App\Services\Notifications\Drivers\NullSmsDriver;
use App\Services\Notifications\Drivers\VeevoTechSmsDriver;
use App\Services\Notifications\Drivers\WhatsAppSmsDriver;
use App\Settings\SmsSettings;
use Illuminate\Support\Facades\App;

class SmsSender
{
    /**
     * Values persisted for {@see SystemSettingKeyEnum::SMS_DRIVER}
     * and accepted by {@see resolveDriver()}.
     *
     * @return list<string>
     */
    public static function configuredDriverNames(): array
    {
        return ['log', 'null', 'veevotech', 'whatsapp'];
    }

    private ?SmsDriverInterface $driver = null;

    /** When true, {@see send()} skips reloading settings so tests can inject a fixed driver. */
    private bool $driverPinned = false;

    public function __construct(private readonly SmsSettings $smsSettings) {}

    public function send(string $to, string $message): void
    {
        if (! $this->driverPinned) {
            // Re-resolve on every send so config changes made during the request lifetime
            // (e.g. admin PATCH) are picked up without a full restart.
            $this->driver = null;
        }

        $this->driver()->send($to, $message);
    }

    public function driver(): SmsDriverInterface
    {
        if ($this->driver === null) {
            $name = (string) ($this->smsSettings->driver ?? 'log');
            $this->driver = $this->resolveDriver($name);
        }

        return $this->driver;
    }

    public function setDriver(SmsDriverInterface $driver): self
    {
        $this->driverPinned = true;
        $this->driver = $driver;

        return $this;
    }

    private function resolveDriver(string $name): SmsDriverInterface
    {
        return match ($name) {
            'log' => App::make(LogSmsDriver::class),
            'null' => App::make(NullSmsDriver::class),
            'veevotech' => App::make(VeevoTechSmsDriver::class),
            'whatsapp' => App::make(WhatsAppSmsDriver::class),
            default => App::make(LogSmsDriver::class),
        };
    }
}
