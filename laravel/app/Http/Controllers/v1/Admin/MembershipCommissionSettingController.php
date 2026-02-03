<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\MembershipCommissionSetting\UpdateMembershipCommissionSettingRequest;
use App\Http\Resources\v1\MembershipCommissionSetting\MembershipCommissionSettingResource;
use App\Models\MembershipCommissionSetting;

class MembershipCommissionSettingController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(MembershipCommissionSetting::class, MembershipCommissionSettingResource::class, 'user');
    }

    public function baseQuery()
    {
        return $this->model->orderBy('level');
    }

    public function index()
    {
        request()->merge(['all' => true]);

        return parent::index();
    }

    public function patch(UpdateMembershipCommissionSettingRequest $request)
    {
        $data = $request->data;

        foreach ($data as $item) {
            $this->model->where('id', $item['id'])->update([
                'new_signup_first_recharge_bonus' => $item['new_signup_first_recharge_bonus'],
                'new_signup_first_recharge_bonus_maximum_amount' => $item['new_signup_first_recharge_bonus_maximum_amount'],
                'first_recharge_bonus_of_day' => $item['first_recharge_bonus_of_day'],
                'first_recharge_bonus_of_day_maximum_amount' => $item['first_recharge_bonus_of_day_maximum_amount'],
                'bonus_per_recharge' => $item['bonus_per_recharge'],
                'bonus_per_recharge_maximum_amount' => $item['bonus_per_recharge_maximum_amount'],
            ]);
        }

        return $this->success($this->index(), 'membership_level_setting_updated');
    }
}
