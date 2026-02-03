<?php

namespace App\Http\Controllers\v1\Admin;

use App\Events\Admin\User\UserUpdated;
use App\Http\Requests\v1\Admin\User\PatchMemberRequest;
use App\Http\Resources\v1\User\LimitedMemberResource;
use App\Http\Resources\v1\User\MemberResource;
use App\Models\User;
use Spatie\QueryBuilder\QueryBuilder;

class MemberController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(User::class, MemberResource::class, 'user');
    }

    protected function baseQuery()
    {
        return $this->model->member()
            ->with([
                'bank_account',
                'parent',
                'referredBy',
                'wallet',
            ])
            ->filterMembersByAgentRole()
            ->filterByAgent();
    }

    public function show(User $member)
    {
        return $this->_show($member);
    }

    public function patch(PatchMemberRequest $request, User $member)
    {
        return $this->_patch($request, $member, callback: fn ($member) => UserUpdated::dispatchIf($member->isChanged(), $member));
    }

    public function referredUsers(User $member)
    {
        $users = QueryBuilder::for($member->referredUsers())
            ->with([
                'bank_account.bank',
                'parent',
                'referredBy',
            ])
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts())
            ->when(
                request()->has('all'),
                fn ($query) => $query->get(),
                fn ($query) => $query->pagination()
            );

        return LimitedMemberResource::collection($users);
    }

    public function usersWithReferrals()
    {
        $users = $this->model->member()
            ->whereHas('referredUsers')
            ->withCount('referredUsers')
            ->select('id', 'username', 'name')
            ->orderBy('username')
            ->get();

        return LimitedMemberResource::collection($users);
    }
}
