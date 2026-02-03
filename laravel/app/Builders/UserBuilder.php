<?php

namespace App\Builders;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Builder;

class UserBuilder extends Builder
{
    public function active()
    {
        $this->whereIn('status', [UserStatusEnum::ACTIVE, UserStatusEnum::APPROVED])
            ->whereNull('blocked_at')
            ->whereNotNull('approved_at')
            ->whereNull('rejected_at');

        return $this;
    }

    public function blocked()
    {
        $this->whereNotNull('blocked_at');

        return $this;
    }

    public function root()
    {
        $this->agent()->whereNull('parent_id');

        return $this;
    }

    public function admin()
    {
        $this->whereType(UserTypeEnum::ADMINISTRATOR);

        return $this;
    }

    public function agent()
    {
        $this->whereType(UserTypeEnum::AGENT);

        return $this;
    }

    public function member()
    {
        $this->whereType(UserTypeEnum::USER);

        return $this;
    }

    public function search($query)
    {
        $this->where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('username', 'like', "%{$query}%")
                ->orWhere('nickname', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->orWhere('memo', 'like', "%{$query}%");
        });

        return $this;
    }

    public function ip($ip)
    {
        if (empty($ip)) {
            return $this;
        }

        $this->where(function ($q) use ($ip) {
            // Search in registration IP (created_at_ip)
            $q->where('created_at_ip', 'like', "%{$ip}%")
                // Search in login IP from authentication_log table
                ->orWhereHas('authentications', function ($authQuery) use ($ip) {
                    $authQuery->where('ip_address', 'like', "%{$ip}%");
                });
        });

        return $this;
    }

    public function filterMembersByAgentRole()
    {
        $this->when(Utils::isAgent(), function ($q) {
            $q->whereIn('id', Utils::getMyMemberIds());
        });

        return $this;
    }

    public function filterAgentsByAgentRole()
    {
        $this->when(Utils::isAgent(), function ($q) {
            $q->whereIn('id', Utils::getMyChildrenIds());
        });

        return $this;
    }

    public function filterUsersByAgentRole()
    {
        $this->when(Utils::isAgent(), function ($q) {
            $q->whereIn('id', Utils::getMyChildrenIds());
        });

        return $this;
    }
}
