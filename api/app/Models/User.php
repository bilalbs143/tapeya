<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Builders\UserBuilder;
use App\Contracts\RoleEnumInterface;
use App\Enums\User\AdminRoleEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Cart;
use App\Models\Shop\Order;
use App\Utils\Services\OtpService;
use App\Utils\Traits\Model\BaseModelTrait;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;
use Spatie\QueryBuilder\AllowedFilter;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use BaseModelTrait;

    use DateFilterTrait;
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nickname',
        'email',
        'phone',
        'date_of_birth',
        'playing_role',
        'bowling_style',
        'batting_style',
        'country',
        'city',
        'avatar',
        'password',
        'type',
        'status',
        'followers_count',
        'created_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
            'type' => UserTypeEnum::class,
            'status' => UserStatusEnum::class,
            'playing_role' => PlayingRoleEnum::class,
            'bowling_style' => BowlingStyleEnum::class,
            'batting_style' => BattingStyleEnum::class,
            'created_by' => 'integer',
        ];
    }

    /**
     * Create a new Eloquent query builder for the model.
     */
    public function newEloquentBuilder($query): Builder
    {
        return new UserBuilder($query);
    }

    /** Phone number for SMS notifications (E.164). */
    public function routeNotificationForSms(): ?string
    {
        if (empty($this->phone)) {
            return null;
        }

        return OtpService::normalizePhone($this->phone);
    }

    public function isAdmin(): bool
    {
        return $this->type === UserTypeEnum::ADMINISTRATOR;
    }

    public function isSystem(): bool
    {
        return $this->type === UserTypeEnum::SYSTEM;
    }

    public function isUser(): bool
    {
        return $this->type === UserTypeEnum::USER;
    }

    /**
     * Backoffice (admin guard): Broadcast Operator role on a normal app account.
     */
    public function hasBroadcastBackofficeRole(): bool
    {
        return $this->isUser() && $this->hasRole(AdminRoleEnum::BROADCASTER);
    }

    /**
     * May call shared backoffice API (administrator accounts or Broadcast Operator staff).
     */
    public function canAccessBackofficeApi(): bool
    {
        if ($this->isSystem()) {
            return false;
        }

        return $this->isAdmin() || $this->hasBroadcastBackofficeRole();
    }

    /**
     * Organizer, backoffice/API creator (`created_by`), or listed Broadcast Staff (pivot).
     */
    public function isTournamentStaff(Tournament $tournament): bool
    {
        if ($this->isSystem()) {
            return false;
        }

        if ((int) $tournament->organizer_id === (int) $this->id) {
            return true;
        }

        if ($tournament->created_by !== null && (int) $tournament->created_by === (int) $this->id) {
            return true;
        }

        return $tournament->broadcasters()->whereKey($this->id)->exists();
    }

    /**
     * App (Sanctum app user): same tournament ops + scoring as organizer when on pivot or organizer_id.
     */
    public function canOperateTournamentInApp(Tournament $tournament): bool
    {
        return $this->isUser() && $this->isTournamentStaff($tournament);
    }

    /**
     * App scoring / scorecard: organizer or pivot staff, or platform administrator (break-glass).
     */
    public function canScoreMatchInApp(TournamentMatch $match): bool
    {
        if ($this->isSystem()) {
            return false;
        }

        if ($this->isAdmin()) {
            return true;
        }

        $match->loadMissing('tournament');

        return $this->canOperateTournamentInApp($match->tournament);
    }

    /**
     * May manage another sponsor's team-level squad when that team is in a tournament this user staffs.
     */
    public function canManageTeamSquadAsTournamentStaff(Team $team): bool
    {
        if (! $this->isUser() || $this->isSystem()) {
            return false;
        }

        return $team->tournaments()
            ->where(function ($q) {
                $uid = $this->id;
                $q->where('organizer_id', $uid)
                    ->orWhere('created_by', $uid)
                    ->orWhereHas('broadcasters', fn ($b) => $b->whereKey($uid));
            })
            ->exists();
    }

    /**
     * Backoffice account that created this user (admin or broadcast staff). Null when the row was created by the user (e.g. app self-registration) or legacy data.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(self::class, 'created_by');
    }

    /**
     * Roles (app: player/organizer/sponsor; admin: future roles). Same pivot for all guards.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')->withTimestamps();
    }

    /** Shop: carts (typically one active per user). */
    public function shopCarts(): HasMany
    {
        return $this->hasMany(Cart::class, 'user_id');
    }

    /** Shop: orders. */
    public function shopOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Follow records where this user is followed (people who follow me).
     */
    public function followers(): HasMany
    {
        return $this->hasMany(UserFollow::class, 'followed_user_id');
    }

    /**
     * Follow records where this user is the follower (users I follow).
     */
    public function following(): HasMany
    {
        return $this->hasMany(UserFollow::class, 'follower_id');
    }

    /**
     * Teams this user is a squad member of (via team_user).
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_user')->withTimestamps();
    }

    /**
     * App-guard roles for this user (for API / serialization). Single query, qualified for joins.
     *
     * @return Collection<int, Role>
     */
    public function getAppRoles(): Collection
    {
        return $this->roles()->where('roles.guard', RoleGuardEnum::APP->value)->get();
    }

    /**
     * @return Collection<int, Role>
     */
    public function getAdminRoles(): Collection
    {
        return $this->roles()->where('roles.guard', RoleGuardEnum::ADMIN->value)->get();
    }

    /**
     * Check if user has a role. Use RoleEnumInterface (AppRoleEnum, AdminRoleEnum) or slug + guard.
     */
    public function hasRole(RoleEnumInterface|string $role, ?string $guard = null): bool
    {
        if ($role instanceof RoleEnumInterface) {
            $slug = $role->value;
            $guard = $role->guard();
        } else {
            $slug = $role;
            $guard ??= RoleGuardEnum::APP->value;
        }

        return $this->roles()->where('slug', $slug)->where('guard', $guard)->exists();
    }

    /** @param array<RoleEnumInterface|string> $roles Guard for string slugs: pass $guard or defaults to app. */
    public function hasAnyRole(array $roles, ?string $guard = null): bool
    {
        $defaultGuard = $guard ?? RoleGuardEnum::APP->value;
        foreach ($roles as $r) {
            if ($this->hasRole($r, $r instanceof RoleEnumInterface ? null : $defaultGuard)) {
                return true;
            }
        }

        return false;
    }

    public function scopeAppUsers(Builder $query): Builder
    {
        return $query->where('type', UserTypeEnum::USER);
    }

    /** Scope: users that have the given role (e.g. all sponsors). Use enum or slug + guard. */
    public function scopeWithRole(Builder $query, RoleEnumInterface|string $role, ?string $guard = null): Builder
    {
        if ($role instanceof RoleEnumInterface) {
            $slug = $role->value;
            $guard = $role->guard();
        } else {
            $slug = $role;
            $guard ??= RoleGuardEnum::APP->value;
        }

        return $query->whereHas('roles', fn (Builder $q) => $q->where('slug', $slug)->where('guard', $guard));
    }

    /**
     * Check if user has a permission (through any of their roles). Use when permissions are attached to roles.
     */
    public function hasPermissionTo(string $permission, ?string $guard = null): bool
    {
        $guard ??= RoleGuardEnum::APP->value;

        return $this->roles()
            ->where('guard', $guard)
            ->whereHas('permissions', fn (Builder $q) => $q->where('slug', $permission)->where('guard', $guard))
            ->exists();
    }

    public function isActive(): bool
    {
        return $this->status === UserStatusEnum::ACTIVE;
    }

    public function isBlocked(): bool
    {
        return $this->status === UserStatusEnum::BLOCKED;
    }

    public function isVerificationPending(): bool
    {
        return $this->status === UserStatusEnum::VERIFICATION_PENDING;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', UserStatusEnum::ACTIVE);
    }

    public function scopeNotBlocked(Builder $query): Builder
    {
        return $query->where('status', '!=', UserStatusEnum::BLOCKED);
    }

    /**
     * Scope: match phone by digits (e.g. 92212212123 or 212212123 matches +92212212123).
     * Normalizes stored phone to digits in SQL so partial digit search works.
     */
    public function scopePhone(Builder $query, ?string $value): void
    {
        $digits = $value !== null && $value !== '' ? preg_replace('/\D/', '', $value) : '';
        if ($digits === '') {
            return;
        }
        $like = '%'.$digits.'%';
        $driver = $query->getConnection()->getDriverName();
        $expr = $driver === 'mysql'
            ? 'REGEXP_REPLACE(COALESCE(phone, ""), "[^0-9]", "") LIKE ?'
            : "REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ?";
        $query->whereRaw($expr, [$like]);
    }

    /**
     * Filters for QueryBuilder (admin/index listing).
     *
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::scope('search'),
            AllowedFilter::exact('type'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('name'),
            'nickname',
            'email',
            AllowedFilter::scope('phone'),
            AllowedFilter::scope('created_between'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
            AllowedFilter::scope('updated_between'),
        ];
    }

    /**
     * Sortable columns for QueryBuilder.
     *
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'name',
            'nickname',
            'email',
            'phone',
            'type',
            'status',
            'created_at',
            'updated_at',
        ];
    }
}
