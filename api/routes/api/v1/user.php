<?php

use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\User\Auth\UserAuthController;
use App\Http\Controllers\User\DeviceTokenController;
use App\Http\Controllers\User\EnumController;
use App\Http\Controllers\User\HeroSliderController;
use App\Http\Controllers\User\HighlightController;
use App\Http\Controllers\User\InterestCampaignController;
use App\Http\Controllers\User\LiveMatchCommentController;
use App\Http\Controllers\User\LiveStreamController;
use App\Http\Controllers\User\MatchCreaseController;
use App\Http\Controllers\User\MatchGraphicSessionController;
use App\Http\Controllers\User\MatchPlayerOfMatchController;
use App\Http\Controllers\User\MatchSquadController;
use App\Http\Controllers\User\MatchTossController;
use App\Http\Controllers\User\NotificationController;
use App\Http\Controllers\User\PlayerController;
use App\Http\Controllers\User\PlayerStatsController;
use App\Http\Controllers\User\PlayingElevenController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\RankingController;
use App\Http\Controllers\User\ScorecardController;
use App\Http\Controllers\User\Shop\BrandController;
use App\Http\Controllers\User\Shop\CartController;
use App\Http\Controllers\User\Shop\CategoryController;
use App\Http\Controllers\User\Shop\OrderController;
use App\Http\Controllers\User\Shop\ProductController;
use App\Http\Controllers\User\SignedMatchGraphicSessionController;
use App\Http\Controllers\User\SponsorController;
use App\Http\Controllers\User\StaticPageController;
use App\Http\Controllers\User\SupportMessageController;
use App\Http\Controllers\User\SystemSettingController;
use App\Http\Controllers\User\TeamController;
use App\Http\Controllers\User\TournamentController;
use App\Http\Controllers\User\TournamentMatchController;
use App\Http\Controllers\User\TournamentReactionController;
use App\Http\Controllers\User\TournamentRequestController;
use App\Http\Controllers\User\TournamentStatsController;
use App\Http\Controllers\User\TournamentTeamController;
use App\Http\Controllers\User\UserFollowController;
use App\Http\Controllers\User\UserTeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User API (app / customer-facing)
|--------------------------------------------------------------------------
*/

Route::get('enums', [EnumController::class, 'index']);

// Highlights — public list; reactions require auth (wired below)
Route::get('highlights', [HighlightController::class, 'index']);
Route::get('highlights/{highlight}', [HighlightController::class, 'show']);
Route::get('hero-sliders', [HeroSliderController::class, 'index']);
Route::get('system-settings', [SystemSettingController::class, 'index']);
Route::get('static-pages/{slug}', [StaticPageController::class, 'show'])
    ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*');
Route::get('interest-campaigns/sidebar', [InterestCampaignController::class, 'sidebar']);

Route::get('matches/{match}/graphic-session/overlay', [SignedMatchGraphicSessionController::class, 'show']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [UserAuthController::class, 'register']);
    Route::post('/request-otp', [UserAuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [UserAuthController::class, 'verifyOtp']);
    Route::post('/logout', [UserAuthController::class, 'logout'])->middleware('auth:api');
});

Route::middleware('auth:api')->prefix('shop')->group(function () {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product:slug}', [ProductController::class, 'show']);
    Route::get('brands', [BrandController::class, 'index']);
    Route::get('brands/{brand}', [BrandController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);
    Route::get('cart', [CartController::class, 'show']);
    Route::post('cart/items', [CartController::class, 'addItem']);
    Route::patch('cart/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('cart/items/{cartItem}', [CartController::class, 'removeItem']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
});

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [UserAuthController::class, 'me']);
    Route::post('device-tokens', [DeviceTokenController::class, 'store'])->middleware('throttle:60,1');
    Route::delete('profile', [ProfileController::class, 'destroy']);
    Route::match(['patch', 'post'], 'profile', [ProfileController::class, 'update']);
    Route::get('countries', [CountryController::class, 'index']);
    Route::get('countries/cities', [CountryController::class, 'cities']);
    Route::post('tournament-requests', [TournamentRequestController::class, 'store']);

    Route::get('interest-campaigns/{slug}', [InterestCampaignController::class, 'show'])
        ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*');
    Route::post('interest-campaigns/{slug}/submissions', [InterestCampaignController::class, 'store'])
        ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*');
    Route::delete('interest-campaigns/{slug}/submissions/me', [InterestCampaignController::class, 'destroy'])
        ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*');

    Route::post('support/messages', [SupportMessageController::class, 'store']);
    Route::get('sponsors', [SponsorController::class, 'index']);
    Route::get('players', [PlayerController::class, 'index']);
    Route::get('teams', [TeamController::class, 'index']);
    Route::post('teams', [TeamController::class, 'store']);
    Route::get('teams/{team}/squad', [TeamController::class, 'showSquad']);
    Route::post('teams/{team}/squad', [TeamController::class, 'storeSquad']);
    Route::get('live/matches', [LiveStreamController::class, 'index']);
    Route::post('matches/{match}/live-comments', [LiveMatchCommentController::class, 'store'])->middleware('throttle:120,1');
    Route::get('tournaments', [TournamentController::class, 'index']);
    Route::get('tournaments/{tournament}', [TournamentController::class, 'show']);
    Route::post('tournaments/{tournament}/like', [TournamentReactionController::class, 'like']);
    Route::post('tournaments/{tournament}/dislike', [TournamentReactionController::class, 'dislike']);
    Route::post('tournaments/{tournament}/share', [TournamentReactionController::class, 'share']);
    Route::get('tournaments/{tournament}/teams', [TournamentTeamController::class, 'index']);
    Route::post('tournaments/{tournament}/teams', [TournamentTeamController::class, 'store']);
    Route::patch('tournaments/{tournament}/teams/{team}', [TournamentTeamController::class, 'update']);
    Route::delete('tournaments/{tournament}/teams/{team}', [TournamentTeamController::class, 'destroy']);
    Route::get('tournaments/{tournament}/standings', [TournamentStatsController::class, 'standings']);
    Route::get('tournaments/{tournament}/season-stats', [TournamentStatsController::class, 'seasonStats']);
    Route::get('tournaments/{tournament}/matches', [TournamentMatchController::class, 'index']);
    Route::post('tournaments/{tournament}/matches', [TournamentMatchController::class, 'store']);
    Route::get('matches/{match}', [TournamentMatchController::class, 'show']);
    Route::get('matches/{match}/graphic-session', [MatchGraphicSessionController::class, 'show']);
    // Scoring-domain crease endpoint — tells the overlay who is about to bat/bowl.
    // Replaces the old graphic-session path so scoring code is decoupled from the
    // graphics subsystem.  The old path is kept as an alias for backward compat.
    Route::patch('matches/{match}/crease', [MatchCreaseController::class, 'update']);
    Route::patch('matches/{match}/toss', [MatchTossController::class, 'update']);
    Route::patch('matches/{match}/player-of-match', [MatchPlayerOfMatchController::class, 'update']);
    Route::get('matches/{match}/match-state', [ScorecardController::class, 'matchState']);
    Route::get('matches/{match}/scorecard', [ScorecardController::class, 'scorecard']);
    Route::get('matches/{match}/player-stats', [ScorecardController::class, 'playerStats']);
    Route::post('matches/{match}/innings/{innings}/balls', [ScorecardController::class, 'storeBall']);
    Route::patch('matches/{match}/innings/{innings}/balls/{ball}', [ScorecardController::class, 'updateBall']);
    Route::delete('matches/{match}/innings/{innings}/balls/last', [ScorecardController::class, 'deleteLastBall']);
    Route::delete('matches/{match}/innings/{innings}/balls/{ball}', [ScorecardController::class, 'deleteBall']);
    Route::get('users/{user}/stats', [PlayerStatsController::class, 'show']);
    Route::get('users/{user}/ranking-position', [PlayerStatsController::class, 'rankingPosition']);
    Route::get('users/{user}/teams', [UserTeamController::class, 'index']);
    Route::post('users/{user}/follow', [UserFollowController::class, 'follow']);
    Route::delete('users/{user}/follow', [UserFollowController::class, 'unfollow']);
    Route::get('rankings', [RankingController::class, 'index']);
    Route::get('matches/{match}/teams/{team}/squad', [MatchSquadController::class, 'show']);
    Route::post('matches/{match}/teams/{team}/squad', [MatchSquadController::class, 'store']);
    Route::get('matches/{match}/teams/{team}/playing-eleven', [PlayingElevenController::class, 'show']);
    Route::post('matches/{match}/teams/{team}/playing-eleven', [PlayingElevenController::class, 'store']);
    // Highlight reactions
    Route::post('highlights/{highlight}/like', [HighlightController::class, 'like']);
    Route::post('highlights/{highlight}/dislike', [HighlightController::class, 'dislike']);
    Route::post('highlights/{highlight}/share', [HighlightController::class, 'share']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('notifications', [NotificationController::class, 'flush']);
});
