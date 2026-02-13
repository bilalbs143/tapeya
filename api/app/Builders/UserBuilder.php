<?php

namespace App\Builders;

use App\Enums\User\UserTypeEnum;
use Illuminate\Database\Eloquent\Builder;

class UserBuilder extends Builder
{
    public function admin(): static
    {
        $this->where('type', UserTypeEnum::ADMINISTRATOR);

        return $this;
    }

    public function user(): static
    {
        $this->where('type', UserTypeEnum::USER);

        return $this;
    }

    public function search(?string $query): static
    {
        if (! $query) {
            return $this;
        }

        $this->where(function (Builder $q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%");
        });

        return $this;
    }
}
