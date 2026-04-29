<?php

namespace App\Models\Relations;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Users on team rosters (team_user) for teams linked to this tournament via tournament_team.
 * Standard BelongsToMany would constrain team_user.team_id to the tournament primary key; this
 * relation replaces that with an exists() on tournament_team (for eager loads, whereHas, and aggregates).
 */
class TournamentSquadPlayersRelation extends BelongsToMany
{
    protected function addWhereConstraints(): void
    {
        $teams = $this->parent->teams();
        $pivot = $teams->getTable();
        $pivotTournamentKey = $teams->getForeignPivotKeyName();
        $pivotTeamKey = $teams->getRelatedPivotKeyName();
        $this->query->whereExists(function ($query) use ($pivot, $pivotTeamKey, $pivotTournamentKey): void {
            $query->from($pivot)
                ->whereColumn($pivot.'.'.$pivotTeamKey, $this->getQualifiedForeignPivotKeyName())
                ->whereColumn($pivot.'.'.$pivotTournamentKey, $this->parent->getQualifiedKeyName());
        });
    }

    /**
     * @param  Builder<Model>  $query
     * @param  Builder<Model>  $parentQuery
     */
    public function getRelationExistenceQuery(Builder $query, Builder $parentQuery, $columns = ['*']): Builder
    {
        if ($parentQuery->getQuery()->from == $query->getQuery()->from) {
            return $this->getRelationExistenceQueryForSelfJoin($query, $parentQuery, $columns);
        }

        $this->performJoin($query);

        $teams = $this->parent->teams();
        $pivot = $teams->getTable();
        $pivotTournamentKey = $teams->getForeignPivotKeyName();
        $pivotTeamKey = $teams->getRelatedPivotKeyName();

        return $query->select($columns)->whereExists(function ($sub) use ($parentQuery, $pivot, $pivotTeamKey, $pivotTournamentKey): void {
            $sub->from($pivot)
                ->whereColumn($pivot.'.'.$pivotTeamKey, $this->getQualifiedForeignPivotKeyName())
                ->whereColumn(
                    $pivot.'.'.$pivotTournamentKey,
                    $parentQuery->getModel()->qualifyColumn($this->parentKey),
                );
        });
    }
}
