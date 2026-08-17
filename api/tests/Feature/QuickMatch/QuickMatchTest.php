<?php

namespace Tests\Feature\QuickMatch;

use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Jobs\RefreshMatchStatsJob;
use App\Models\CricketMatch;
use App\Models\PlayerBattingStats;
use App\Models\PlayerMatchBatting;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class QuickMatchTest extends TestCase
{
    use BuildsScoringMatch;
    use RefreshDatabase;

    private function activeUser(array $attrs = []): User
    {
        return User::factory()->create(array_merge([
            'type' => 'user',
            'status' => 'active',
        ], $attrs));
    }

    /**
     * @return array<string, mixed>
     */
    private function basePayload(User $owner, array $override = []): array
    {
        $existing = $this->activeUser(['phone' => '+923009990001']);

        return array_merge([
            'cricket_format' => 'tape_ball',
            'overs' => 10,
            'players_per_side' => 2,
            'home' => [
                'name' => 'Usman XI',
                'players' => [
                    ['user_id' => $existing->id],
                    ['name' => 'Ali Khan', 'phone' => '+923001111111'],
                ],
            ],
            'away' => [
                'name' => 'Street Kings',
                'players' => [
                    ['name' => 'Hamza Iqbal', 'phone' => '+923002222222'],
                    ['name' => 'Sara Ahmed', 'phone' => '+923003333333'],
                ],
            ],
        ], $override);
    }

    public function test_create_scheduled_quick_match_with_inline_player(): void
    {
        $owner = $this->activeUser();

        $response = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated()
            ->assertJsonPath('data.kind', MatchKindEnum::QUICK->value)
            ->assertJsonPath('data.tournament', null)
            ->assertJsonPath('data.venue_name', null)
            ->assertJsonPath('data.status', MatchStatusEnum::SCHEDULED->value)
            ->assertJsonPath('data.created_by.id', $owner->id)
            ->assertJsonPath('data.home_team.user_id', $owner->id)
            ->assertJsonPath('data.away_team.user_id', $owner->id);

        $inline = User::query()->where('phone', '+923001111111')->first();
        $this->assertNotNull($inline);
        $this->assertSame(UserTypeEnum::USER, $inline->type);
        $this->assertTrue($inline->added_via_quick_match);
        $this->assertSame((int) $owner->id, (int) $inline->created_by);
        $this->assertSame('ali_khan', $inline->nickname);

        $match = CricketMatch::query()->find($response->json('data.id'));
        $this->assertNull($match->tournament_id);
        $this->assertSame($owner->id, (int) $match->homeTeam->user_id);
    }

    public function test_create_with_toss_starts_match_and_allows_scoring(): void
    {
        $owner = $this->activeUser();
        $payload = $this->basePayload($owner, [
            'toss' => [
                'winning_side' => 'home',
                'chose_to_bat_or_bowl' => 'bat',
            ],
        ]);

        $response = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $payload)
            ->assertCreated()
            ->assertJsonPath('data.status', MatchStatusEnum::TOSS_DONE->value);

        $this->assertArrayHasKey('match_state', $response->json('data'));

        $matchId = (int) $response->json('data.id');
        $match = CricketMatch::query()->with('innings')->findOrFail($matchId);
        $this->assertCount(2, $match->innings);

        $homePlayers = collect($response->json('data.home_team.players'));
        $awayPlayers = collect($response->json('data.away_team.players'));
        $strikerId = (int) $homePlayers[0]['id'];
        $nonStrikerId = (int) $homePlayers[1]['id'];
        $bowlerId = (int) $awayPlayers[0]['id'];

        $match->update([
            'pending_crease' => [
                'next_batter_id' => $strikerId,
                'next_non_striker_id' => $nonStrikerId,
                'next_bowler_id' => $bowlerId,
            ],
        ]);

        $innings1 = $match->innings->firstWhere('innings_number', 1);
        $this->actingAs($owner, 'api')
            ->postJson("/api/v1/matches/{$matchId}/innings/{$innings1->id}/balls", [
                'striker_id' => $strikerId,
                'non_striker_id' => $nonStrikerId,
                'bowler_id' => $bowlerId,
                'runs_off_bat' => 4,
            ])
            ->assertCreated();

        RefreshMatchStatsJob::dispatchSync($matchId);

        $this->assertTrue(PlayerMatchBatting::query()->where('match_id', $matchId)->where('player_id', $strikerId)->exists());
        $quickRow = PlayerBattingStats::query()
            ->where('player_id', $strikerId)
            ->where('tournament_type', 'quick')
            ->where('cricket_format', 'tape_ball')
            ->first();
        $this->assertNotNull($quickRow);
        $this->assertSame(4, (int) $quickRow->runs);
        $this->assertSame(0, PlayerBattingStats::query()
            ->where('player_id', $strikerId)
            ->whereIn('tournament_type', ['league', 'open_tournament', 'emerging'])
            ->count());
    }

    public function test_duplicate_phone_returns_422(): void
    {
        $owner = $this->activeUser();
        $this->activeUser(['phone' => '+923001111111']);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['home.players.1.phone']);
    }

    public function test_non_owner_cannot_score(): void
    {
        $owner = $this->activeUser();
        $stranger = $this->activeUser(['phone' => '+923009990099']);

        $matchId = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner, [
                'toss' => ['winning_side' => 'home', 'chose_to_bat_or_bowl' => 'bat'],
            ]))
            ->assertCreated()
            ->json('data.id');

        $match = CricketMatch::query()->with('innings')->findOrFail($matchId);
        $innings1 = $match->innings->firstWhere('innings_number', 1);
        $squadIds = DB::table('match_squads')
            ->where('match_id', $matchId)
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->values();

        $this->actingAs($stranger, 'api')
            ->postJson("/api/v1/matches/{$matchId}/innings/{$innings1->id}/balls", [
                'striker_id' => $squadIds[0],
                'non_striker_id' => $squadIds[1],
                'bowler_id' => $squadIds[2],
                'runs_off_bat' => 1,
            ])
            ->assertForbidden();
    }

    public function test_tournament_match_id_is_not_a_quick_match(): void
    {
        $this->setUpScoringMatch();

        $this->actingAs($this->organizer, 'api')
            ->getJson("/api/v1/quick-matches/{$this->scoringMatch->id}")
            ->assertNotFound();
    }

    public function test_toss_rejects_when_side_player_count_not_exact(): void
    {
        $owner = $this->activeUser();
        $payload = $this->basePayload($owner, [
            'players_per_side' => 2,
            'home' => [
                'name' => 'Usman XI',
                'players' => [
                    ['name' => 'Ali Khan', 'phone' => '+923001111111'],
                    ['name' => 'Bilal Raza', 'phone' => '+923001111112'],
                    ['name' => 'Omar Farooq', 'phone' => '+923001111113'],
                ],
            ],
            'toss' => [
                'winning_side' => 'home',
                'chose_to_bat_or_bowl' => 'bat',
            ],
        ]);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['home.players']);

        $this->assertSame(0, CricketMatch::query()->where('kind', MatchKindEnum::QUICK)->count());
        $this->assertSame(0, DB::table('match_players')->count());
    }

    public function test_reuse_team_id_does_not_rename_saved_team(): void
    {
        $owner = $this->activeUser();
        $team = Team::create([
            'name' => 'Saved XI',
            'code' => 'SAV'.uniqid(),
            'user_id' => $owner->id,
            'created_by' => $owner->id,
        ]);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner, [
                'home' => [
                    'team_id' => $team->id,
                    'name' => 'Renamed On Wizard',
                    'players' => [
                        ['name' => 'Bilal Raza', 'phone' => '+923004444444'],
                        ['name' => 'Omar Farooq', 'phone' => '+923005555555'],
                    ],
                ],
            ]))
            ->assertCreated()
            ->assertJsonPath('data.home_team.id', $team->id)
            ->assertJsonPath('data.home_team.name', 'Saved XI');

        $this->assertSame('Saved XI', $team->fresh()->name);
    }

    public function test_reuse_owned_team_and_list_mine(): void
    {
        $owner = $this->activeUser();
        $team = Team::create([
            'name' => 'Saved XI',
            'code' => 'SAV'.uniqid(),
            'user_id' => $owner->id,
            'created_by' => $owner->id,
        ]);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner, [
                'home' => [
                    'team_id' => $team->id,
                    'players' => [
                        ['name' => 'Bilal Raza', 'phone' => '+923004444444'],
                        ['name' => 'Omar Farooq', 'phone' => '+923005555555'],
                    ],
                ],
            ]))
            ->assertCreated()
            ->assertJsonPath('data.home_team.id', $team->id)
            ->assertJsonPath('data.home_team.user_id', $owner->id);

        $this->actingAs($owner, 'api')
            ->getJson('/api/v1/quick-matches?all=1')
            ->assertOk()
            ->assertJsonFragment(['kind' => MatchKindEnum::QUICK->value]);
    }

    public function test_tournament_match_list_excludes_quick_rows(): void
    {
        $this->setUpScoringMatch();
        $owner = $this->organizer->fresh();
        $owner->update(['status' => 'active']);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $list = $this->actingAs($owner, 'api')
            ->getJson("/api/v1/tournaments/{$this->scoringMatch->tournament_id}/matches?all=1")
            ->assertOk()
            ->json();
        $rows = isset($list['data'][0]) ? $list['data'] : ($list['data']['data'] ?? []);
        $ids = collect($rows)->pluck('id');

        $this->assertTrue($ids->contains($this->scoringMatch->id));
        $this->assertFalse(
            CricketMatch::query()->where('kind', MatchKindEnum::QUICK)->whereIn('id', $ids)->exists()
        );
    }

    public function test_owner_can_remove_player_from_scheduled_quick_match(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $homeId = (int) $created->json('data.home_team.id');
        $playerId = (int) collect($created->json('data.home_team.players'))->first()['id'];

        $this->assertSame(1, DB::table('match_squads')
            ->where('match_id', $matchId)
            ->where('team_id', $homeId)
            ->where('user_id', $playerId)
            ->count());

        $this->actingAs($owner, 'api')
            ->deleteJson("/api/v1/quick-matches/{$matchId}/teams/{$homeId}/players/{$playerId}")
            ->assertOk()
            ->assertJsonPath('data.removed_user_id', $playerId);

        $this->assertSame(0, DB::table('match_squads')
            ->where('match_id', $matchId)
            ->where('team_id', $homeId)
            ->where('user_id', $playerId)
            ->count());

        $remaining = collect(
            $this->actingAs($owner, 'api')
                ->getJson("/api/v1/quick-matches/{$matchId}")
                ->assertOk()
                ->json('data.home_team.players')
        )->pluck('id');
        $this->assertFalse($remaining->contains($playerId));
    }

    public function test_non_owner_cannot_update_or_mutate_players(): void
    {
        $owner = $this->activeUser();
        $stranger = $this->activeUser(['phone' => '+923009990099']);
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $homeId = (int) $created->json('data.home_team.id');
        $playerId = (int) collect($created->json('data.home_team.players'))->first()['id'];

        $this->actingAs($stranger, 'api')
            ->patchJson("/api/v1/quick-matches/{$matchId}", ['overs' => 8])
            ->assertForbidden();

        $this->actingAs($stranger, 'api')
            ->postJson("/api/v1/quick-matches/{$matchId}/teams/{$homeId}/players", [
                'name' => 'Intruder',
                'phone' => '+923008888888',
            ])
            ->assertForbidden();

        $this->actingAs($stranger, 'api')
            ->deleteJson("/api/v1/quick-matches/{$matchId}/teams/{$homeId}/players/{$playerId}")
            ->assertForbidden();
    }

    public function test_owner_can_update_scheduled_settings_and_add_player(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner, [
                'players_per_side' => 3,
                'home' => [
                    'name' => 'Usman XI',
                    'players' => [
                        ['name' => 'Ali Khan', 'phone' => '+923001111111'],
                        ['name' => 'Bilal Raza', 'phone' => '+923001111112'],
                    ],
                ],
                'away' => [
                    'name' => 'Street Kings',
                    'players' => [
                        ['name' => 'Hamza Iqbal', 'phone' => '+923002222222'],
                        ['name' => 'Sara Ahmed', 'phone' => '+923003333333'],
                    ],
                ],
            ]))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $homeId = (int) $created->json('data.home_team.id');

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/quick-matches/{$matchId}", [
                'overs' => 12,
                'players_per_side' => 3,
            ])
            ->assertOk()
            ->assertJsonPath('data.overs', 12);

        $this->actingAs($owner, 'api')
            ->postJson("/api/v1/quick-matches/{$matchId}/teams/{$homeId}/players", [
                'user_id' => $this->activeUser(['phone' => '+923007777001'])->id,
            ])
            ->assertCreated();

        $this->assertCount(3, $this->actingAs($owner, 'api')
            ->getJson("/api/v1/quick-matches/{$matchId}")
            ->json('data.home_team.players'));
    }

    public function test_owner_can_change_a_sides_team_before_toss(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $originalHomeId = (int) $created->json('data.home_team.id');
        $awayId = (int) $created->json('data.away_team.id');

        $otherOwnedTeam = Team::create([
            'name' => 'Bench XI',
            'code' => 'BEN'.uniqid(),
            'user_id' => $owner->id,
            'created_by' => $owner->id,
        ]);

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/quick-matches/{$matchId}", [
                'home' => ['team_id' => $otherOwnedTeam->id],
            ])
            ->assertOk()
            ->assertJsonPath('data.home_team.id', $otherOwnedTeam->id)
            ->assertJsonPath('data.home_team.players', []);

        // Old side's squad/XI rows are gone, not just unlinked.
        $this->assertSame(0, DB::table('match_squads')
            ->where('match_id', $matchId)
            ->where('team_id', $originalHomeId)
            ->count());

        // Away is untouched.
        $this->assertSame($awayId, (int) $this->actingAs($owner, 'api')
            ->getJson("/api/v1/quick-matches/{$matchId}")
            ->json('data.away_team.id'));
    }

    public function test_change_side_to_brand_new_team_by_name(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/quick-matches/{$matchId}", [
                'away' => ['name' => 'Brand New Away'],
            ])
            ->assertOk()
            ->assertJsonPath('data.away_team.name', 'Brand New Away')
            ->assertJsonPath('data.away_team.players', []);
    }

    public function test_change_side_rejects_same_team_as_other_side(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $homeId = (int) $created->json('data.home_team.id');

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/quick-matches/{$matchId}", [
                'away' => ['team_id' => $homeId],
            ])
            ->assertStatus(422);
    }

    public function test_change_side_rejects_team_owner_does_not_manage(): void
    {
        $owner = $this->activeUser();
        $stranger = $this->activeUser(['phone' => '+923009990088']);
        $strangerTeam = Team::create([
            'name' => "Stranger's XI",
            'code' => 'STR'.uniqid(),
            'user_id' => $stranger->id,
            'created_by' => $stranger->id,
        ]);
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/quick-matches/{$matchId}", [
                'home' => ['team_id' => $strangerTeam->id],
            ])
            ->assertStatus(422);
    }

    public function test_add_player_rejects_when_side_full_before_toss(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $homeId = (int) $created->json('data.home_team.id');

        $this->actingAs($owner, 'api')
            ->postJson("/api/v1/quick-matches/{$matchId}/teams/{$homeId}/players", [
                'name' => 'Extra Player',
                'phone' => '+923006666666',
            ])
            ->assertStatus(422);
    }

    public function test_create_rejects_players_over_players_per_side(): void
    {
        $owner = $this->activeUser();
        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner, [
                'players_per_side' => 2,
                'home' => [
                    'name' => 'Usman XI',
                    'players' => [
                        ['name' => 'Ali Khan', 'phone' => '+923001111111'],
                        ['name' => 'Bilal Raza', 'phone' => '+923001111112'],
                        ['name' => 'Omar Farooq', 'phone' => '+923001111113'],
                    ],
                ],
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['home.players']);
    }

    public function test_toss_promotes_squad_to_playing_eleven_for_quick_match(): void
    {
        $owner = $this->activeUser();
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/quick-matches', $this->basePayload($owner))
            ->assertCreated();

        $matchId = (int) $created->json('data.id');
        $homeId = (int) $created->json('data.home_team.id');
        $awayId = (int) $created->json('data.away_team.id');

        $this->assertSame(0, DB::table('match_players')->where('match_id', $matchId)->count());

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/matches/{$matchId}/toss", [
                'winning_team_id' => $homeId,
                'chose_to_bat_or_bowl' => 'bat',
            ])
            ->assertOk();

        $this->assertSame(4, DB::table('match_players')->where('match_id', $matchId)->count());
        $this->assertSame(MatchStatusEnum::TOSS_DONE->value, CricketMatch::query()->find($matchId)->status->value
            ?? (string) CricketMatch::query()->find($matchId)->status);
    }
}
