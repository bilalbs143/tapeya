<?php

namespace Database\Seeders;

use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SystemUserSeeder extends Seeder
{
    public function run(): void
    {
        User::withTrashed()->updateOrCreate(
            ['email' => 'system@tapeya.com'],
            [
                'name' => 'System User',
                'password' => Str::random(32),
                'type' => UserTypeEnum::SYSTEM,
                'deleted_at' => null,
            ]
        );
    }
}
