<?php

namespace App\Models;

use App\Enums\User\UserTypeEnum;
use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class AuthenticationLog extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'authentication_log';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = ['authenticatable_id', 'authenticatable_type'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
    ];

    /**
     * Get the authenticatable entity that the authentication log belongs to.
     */
    public function authenticatable()
    {
        return $this->morphTo();
    }

    public function scopeLoginAfter($query, $date)
    {
        return $query->dateFilter('login_at', $date, '>=');
    }

    public function scopeLoginBefore($query, $date)
    {
        return $query->dateFilter('login_at', $date, '<=');
    }

    public function scopeLogoutAfter($query, $date)
    {
        return $query->dateFilter('logout_at', $date, '>=');
    }

    public function scopeLogoutBefore($query, $date)
    {
        return $query->dateFilter('logout_at', $date, '<=');
    }

    public function scopeIgnoreSystem($query)
    {
        $query->whereHas('authenticatable', function ($q) {
            $q->where('type', '!=', UserTypeEnum::SYSTEM);
        });
    }

    public function scopeCurrent($query)
    {
        $query->ignoreSystem()->whereNull('logout_at')->whereIn('authenticatable_id', function ($query) {
            $query->select('tokenable_id')->from('personal_access_tokens')->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    public function logout()
    {
        $token = PersonalAccessToken::find($this->oauth_access_token_id);
        $this->update(['logout_at' => now()]);

        if ($token) {
            $token->delete();
        }

        return true;
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('authenticatable_id'),
            'ip_address',
            'user_agent',
            'authenticatable.name',
            AllowedFilter::exact('authenticatable.username'),
            'authenticatable.phone',
            'authenticatable.status',
            AllowedFilter::exact('authenticatable.bank_account.account_number'),
            AllowedFilter::exact('authenticatable.bank_account.account_holder'),
            AllowedFilter::scope('login_after'),
            AllowedFilter::scope('login_before'),
            AllowedFilter::scope('logout_after'),
            AllowedFilter::scope('logout_before'),
        ];
    }

    public static function getSorts()
    {
        return [
            'id',
            'login_at',
            'logout_at',
            AllowedSort::custom('authenticatable_id.username', new SortByUser),
            AllowedSort::custom('authenticatable_id.name', new SortByUser),
            AllowedSort::custom('authenticatable_id.account_holder', new SortByUserByBank),
            AllowedSort::custom('authenticatable_id.account_number', new SortByUserByBank),
        ];
    }
}
