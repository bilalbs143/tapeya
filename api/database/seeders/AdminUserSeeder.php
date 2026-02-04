<?php

namespace Database\Seeders;

use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tapeya.com'],
            [
                'name' => 'Administrator',
                'password' => '123456@Qq',
                'type' => UserTypeEnum::ADMINISTRATOR,
            ]
        );
    }
}

