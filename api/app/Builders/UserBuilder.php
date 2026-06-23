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

        $safe = '%'.addcslashes(mb_strtolower($query), '%_\\').'%';
        $digits = preg_replace('/\D/', '', $query);
        $phoneLike = $digits !== '' ? '%'.$digits.'%' : null;
        $phoneExpr = "REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ?";

        $this->where(function (Builder $q) use ($safe, $phoneLike, $phoneExpr) {
            $q->whereRaw('LOWER(name) LIKE ?', [$safe])
                ->orWhereRaw("LOWER(COALESCE(nickname, '')) LIKE ?", [$safe])
                ->orWhereRaw('LOWER(email) LIKE ?', [$safe]);
            if ($phoneLike !== null) {
                $q->orWhereRaw($phoneExpr, [$phoneLike]);
            }
        });

        return $this;
    }
}
