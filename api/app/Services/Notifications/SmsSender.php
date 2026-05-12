<?php

namespace App\Services\Notifications;

use App\Contracts\Notifications\SmsDriverInterface;
use App\Services\Notifications\Drivers\ApiSmsDriver;
use App\Services\Notifications\Drivers\LogSmsDriver;
use App\Services\Notifications\Drivers\NullSmsDriver;
use App\Services\Notifications\Drivers\VeevoTechSmsDriver;
use App\Services\Notifications\Drivers\WhatsAppSmsDriver;
use Illuminate\Support\Facades\App;

class SmsSender
{
    private ?SmsDriverInterface $driver = null;

    public function send(string $to, string $message): void
    {
        $this->driver()->send($to, $message);
    }

    public function driver(): SmsDriverInterface
    {
        if ($this->driver === null) {
            $name = config('notifications.sms.driver', 'log');
            $this->driver = $this->resolveDriver($name);
        }

        return $this->driver;
    }

    public function setDriver(SmsDriverInterface $driver): self
    {
        $this->driver = $driver;

        return $this;
    }

    private function resolveDriver(string $name): SmsDriverInterface
    {
        return match ($name) {
            'log'       => App::make(LogSmsDriver::class),
            'null'      => App::make(NullSmsDriver::class),
            'api'       => App::make(ApiSmsDriver::class),
            'veevotech' => App::make(VeevoTechSmsDriver::class),
            'whatsapp'  => App::make(WhatsAppSmsDriver::class),
            default     => App::make(LogSmsDriver::class),
        };
    }
}
