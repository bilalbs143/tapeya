<?php

namespace App\Models;

use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Prunable;

class UserGameSession extends BaseModel
{
    use Prunable;

    protected $fillable = [
        'user_id',
        'game_id',
        'company_id',
        'provider_id',
        'ip_address',
        'user_agent',
        'token',
        'launch_url',
        'last_activity_at',
        'requested_at',
        'started_at',
        'ended_at',
        'restored_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_by',
    ];

    protected function casts()
    {
        return [
            'requested_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'restored_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function scopeActive(Builder $query)
    {
        $query->whereNull('ended_at');
    }

    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subMonths(6));
    }

    public static function closePreviousSessions(?User $user = null, ?Company $company = null)
    {
        return self::active()
            ->when($user, function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where(function ($query) {
                $query->where('created_at', '<=', now()->subHours(12));
                $query->orWhere('last_activity_at', '<=', now()->subHours(2));
            })
            ->when($company, function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })
            ->update(['ended_at' => now()]);
    }

    public static function createSession(Company $company, ?Provider $provider, Game $game, User $user): self
    {
        $token = self::generateUniqueValue('token', $company->key->tokenLength());

        $data = [
            'user_id' => $user->id,
            'game_id' => $game->id,
            'ip_address' => Utils::getClientIp(),
            'user_agent' => request()->userAgent(),
            'token' => $token,
            'requested_at' => now(),
        ];

        if ($company) {
            $data['company_id'] = $company->id;
        }

        if ($provider) {
            $data['provider_id'] = $provider->id;
        }

        self::closePreviousSessions($user, $company);

        return self::create($data);
    }

    public function start()
    {
        if ($this->started_at) {
            return;
        }

        $this->update(['started_at' => now()]);

        return $this;
    }

    public function updateLastActivity()
    {
        $this->touch('last_activity_at');
    }
}
