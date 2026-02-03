<?php

namespace App\Builders;

use Illuminate\Database\Eloquent\Builder;

class GameBuilder extends Builder
{
    public function active()
    {
        $this->enabled()
            ->isEnabled()
            // ->live()
            ->released()
            ->notRecalled();

        return $this;
    }

    public function disabled()
    {
        $this->whereNotNull('disabled_at');

        return $this;
    }

    public function disabledByAdmin()
    {
        $this->whereNotNull('disabled_by_admin_at');

        return $this;
    }

    public function enabled()
    {
        $this->whereNull('disabled_at');

        return $this;
    }

    public function enabledByAdmin()
    {
        $this->whereNull('disabled_by_admin_at');

        return $this;
    }

    public function isEnabled()
    {
        $this->where('is_enabled', true);

        return $this;
    }

    public function live()
    {
        $this->where('is_live_game', true);

        return $this;
    }

    public function released()
    {
        $this->where(function ($query) {
            $query->whereNull('released_at');
            $query->orWhereDate('released_at', '<=', now());
        });

        return $this;
    }

    public function notRecalled()
    {
        $this->where(function ($query) {
            $query->whereNull('recalled_at');
            $query->orWhereDate('recalled_at', '>=', now());
        });

        return $this;
    }

    public function gameIds(array $gameIds)
    {
        $this->whereIn('game_id', $gameIds);

        return $this;
    }

    public function gameId(mixed $gameId)
    {
        $this->where('game_id', $gameId);

        return $this;
    }

    public function companyId(int $companyId)
    {
        $this->whereCompanyId($companyId);

        return $this;
    }

    public function providerId(int $providerId)
    {
        $this->whereProviderId($providerId);

        return $this;
    }
}
