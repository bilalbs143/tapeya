<?php

namespace App\Utils\Traits\Model\Filters;

use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Builder;

trait FilterTrait
{
    use DateFilterTrait, OperationFilterTrait, OperatorFilterTrait;

    public function scopeActive(Builder $query)
    {
        $query->where('is_active', true);
    }

    public function scopeToday(Builder $query, string $column = 'created_at')
    {
        $query->whereDate($column, today());
    }

    public function scopeYesterday(Builder $query, string $column = 'created_at')
    {
        $query->whereDate($column, Utils::yesterday());
    }

    public function scopeTillYesterday(Builder $query, string $column = 'created_at')
    {
        $query->whereDate($column, '<=', Utils::yesterday());
    }

    public function scopeFilterByAgentRole(Builder $query, string $column = 'user_id', ?bool $justMembers = false)
    {
        $query->when(Utils::isAgent(), function ($q) use ($column, $justMembers) {
            $ids = [];

            if (request()->filled('_agent_id') && in_array(request('_agent_id'), Utils::getMyChildrenIds())) {
                $agent = User::agent()->findOrFail(request('_agent_id'));
                $ids = $justMembers ? Utils::getAgentMemberIds($agent) : Utils::getAgentChildrenIds($agent);
            } else {
                $ids = $justMembers ? Utils::getMyMemberIds() : Utils::getMyChildrenIds();
            }

            $q->whereIn($column, $ids);
        })->when(Utils::isAdmin() && request()->filled('_agent_id'), function ($q) use ($column, $justMembers) {
            $agent = User::agent()->findOrFail(request('_agent_id'));
            $ids = $justMembers ? Utils::getAgentMemberIds($agent) : Utils::getAgentChildrenIds($agent);
            $q->whereIn($column, $ids);
        });
    }
}
