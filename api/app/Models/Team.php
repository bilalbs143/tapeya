<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends BaseModel
{
    protected $table = 'teams';

    protected $fillable = [
        'name',
        'logo',
        'code',
        'country',
        'city',
        'user_id',
        'created_by',
    ];

    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Icon / star players for this team.
     */
    public function iconPlayers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_icon_players')
            ->withTimestamps();
    }

    /**
     * Full squad/players for this team (team-level squad, not match squad).
     */
    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withTimestamps();
    }

    /**
     * Tournaments this team is participating in.
     */
    public function tournaments(): BelongsToMany
    {
        return $this->belongsToMany(Tournament::class, 'tournament_team')
            ->withTimestamps();
    }
}
