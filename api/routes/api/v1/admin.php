<?php

use App\Http\Controllers\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\Admin\CricketDashboardController;
use App\Http\Controllers\Admin\EnumController;
use App\Http\Controllers\Admin\GraphicCommandCatalogController;
use App\Http\Controllers\Admin\GraphicCommandController;
use App\Http\Controllers\Admin\GraphicSessionController;
use App\Http\Controllers\Admin\GraphicSignedUrlController;
use App\Http\Controllers\Admin\GraphicThemeController;
use App\Http\Controllers\Admin\HeroSliderController;
use App\Http\Controllers\Admin\HighlightController as AdminHighlightController;
use App\Http\Controllers\Admin\MatchGraphicCaptionController;
use App\Http\Controllers\Admin\MatchGraphicPlayerListController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PlayerController;
use App\Http\Controllers\Admin\PushNotificationController;
use App\Http\Controllers\Admin\PushNotificationTemplateController;
use App\Http\Controllers\Admin\Shop\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\Shop\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\Shop\EcommerceDashboardController;
use App\Http\Controllers\Admin\Shop\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\Shop\ProductController as AdminProductController;
use App\Http\Controllers\Admin\StaticPageController;
use App\Http\Controllers\Admin\StreamController;
use App\Http\Controllers\Admin\SystemSettingController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\TournamentBroadcasterController;
use App\Http\Controllers\Admin\TournamentController;
use App\Http\Controllers\Admin\TournamentInterestCampaignController;
use App\Http\Controllers\Admin\TournamentInterestSubmissionController;
use App\Http\Controllers\Admin\TournamentMatchController;
use App\Http\Controllers\Admin\TournamentMatchSquadController;
use App\Http\Controllers\Admin\TournamentRequestController;
use App\Http\Controllers\Admin\TournamentTeamsController;
use App\Http\Controllers\Admin\TournamentTeamSquadController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserSearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API (backoffice)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth:api');

    Route::middleware(['auth:api', 'admin.only'])->group(function () {
        Route::get('enums', [EnumController::class, 'index']);
        Route::apiResource('highlights', AdminHighlightController::class);
        Route::get('push-notifications', [PushNotificationController::class, 'index']);
        Route::post('push-notifications/send', [PushNotificationController::class, 'send']);
        Route::get('push-notifications/{pushNotificationLog}', [PushNotificationController::class, 'show']);
        Route::get('push-notification-templates', [PushNotificationTemplateController::class, 'index']);
        Route::get('push-notification-templates/{pushNotificationTemplate}', [PushNotificationTemplateController::class, 'show']);
        Route::patch('push-notification-templates/{pushNotificationTemplate}', [PushNotificationTemplateController::class, 'update']);
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('notifications', [NotificationController::class, 'flush']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::get('countries', [CountryController::class, 'index']);
        Route::get('countries/cities', [CountryController::class, 'cities']);
        Route::get('users/search', [UserSearchController::class, 'index']);
        Route::apiResource('users', UserController::class);
        Route::post('players/import-csv', [PlayerController::class, 'importCsv']);
        Route::apiResource('players', PlayerController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('teams', TeamController::class);
        Route::apiResource('hero-sliders', HeroSliderController::class);
        Route::apiResource('static-pages', StaticPageController::class);
        Route::get('system-settings', [SystemSettingController::class, 'index']);
        Route::get('system-settings/{key}', [SystemSettingController::class, 'show'])->where('key', '[a-z0-9_]+');
        Route::patch('system-settings/{key}', [SystemSettingController::class, 'patch'])->where('key', '[a-z0-9_]+');
        Route::apiResource('tournaments', TournamentController::class);
        Route::get('tournaments/{tournament}/broadcaster', [TournamentBroadcasterController::class, 'index']);
        Route::post('tournaments/{tournament}/broadcaster', [TournamentBroadcasterController::class, 'store']);
        Route::delete('tournaments/{tournament}/broadcaster', [TournamentBroadcasterController::class, 'destroy']);
        Route::get('tournaments/{tournament}/teams', [TournamentTeamsController::class, 'index']);
        Route::post('tournaments/{tournament}/teams', [TournamentTeamsController::class, 'store']);
        Route::get('tournaments/{tournament}/teams/{team}/squad', [TournamentTeamSquadController::class, 'show']);
        Route::get('tournaments/{tournament}/squad-occupancy', [TournamentTeamSquadController::class, 'occupancy']);
        Route::post('tournaments/{tournament}/teams/{team}/squad', [TournamentTeamSquadController::class, 'store']);
        Route::patch('tournaments/{tournament}/teams/{team}', [TournamentTeamsController::class, 'update']);
        Route::delete('tournaments/{tournament}/teams/{team}', [TournamentTeamsController::class, 'destroy']);
        Route::get('tournaments/{tournament}/matches', [TournamentMatchController::class, 'index']);
        Route::post('tournaments/{tournament}/matches', [TournamentMatchController::class, 'store']);
        Route::get('matches/{match}', [TournamentMatchController::class, 'show']);
        Route::match(['post', 'patch'], 'matches/{match}', [TournamentMatchController::class, 'update']);
        Route::post('matches/{match}/stream', [StreamController::class, 'create']);
        Route::get('matches/{match}/stream', [StreamController::class, 'show']);
        Route::post('matches/{match}/stream/end', [StreamController::class, 'end']);
        Route::delete('matches/{match}/stream', [StreamController::class, 'destroy']);
        Route::post('matches/{match}/stream/sync', [StreamController::class, 'sync']);
        Route::patch('matches/{match}/stream/provider', [StreamController::class, 'setProvider']);
        Route::get('matches/{match}/teams/{team}/squad', [TournamentMatchSquadController::class, 'show']);
        Route::post('matches/{match}/teams/{team}/squad', [TournamentMatchSquadController::class, 'store']);
        Route::get('matches/{match}/graphic-player-lists', MatchGraphicPlayerListController::class);

        Route::get('graphic-themes', [GraphicThemeController::class, 'index']);
        Route::get('graphic-command-catalog', [GraphicCommandCatalogController::class, 'index']);
        Route::get('matches/{match}/graphic-session', [GraphicSessionController::class, 'show']);
        Route::post('matches/{match}/graphic-session', [GraphicSessionController::class, 'store']);
        Route::get('matches/{match}/graphic-session/signed-url', [GraphicSignedUrlController::class, 'signedUrl']);
        Route::match(['put', 'patch'], 'matches/{match}/graphic-session', [GraphicSessionController::class, 'update']);
        Route::get('matches/{match}/graphic-session/captions', [MatchGraphicCaptionController::class, 'index']);
        Route::post('matches/{match}/graphic-session/captions', [MatchGraphicCaptionController::class, 'store']);
        Route::match(['put', 'patch'], 'matches/{match}/graphic-session/captions/{caption}', [MatchGraphicCaptionController::class, 'update']);
        Route::delete('matches/{match}/graphic-session/captions/{caption}', [MatchGraphicCaptionController::class, 'destroy']);

        Route::get('matches/{match}/graphic-session/commands', [GraphicCommandController::class, 'index']);
        Route::delete('matches/{match}/graphic-session/commands', [GraphicCommandController::class, 'destroyHistory']);
        Route::post('matches/{match}/graphic-session/commands', [GraphicCommandController::class, 'store']);
        Route::post('matches/{match}/graphic-session/commands/{command}/activate', [GraphicCommandController::class, 'activate']);

        Route::post('media/{type}/{id}/{field}', [MediaController::class, 'upload']);
        Route::delete('media/{type}/{id}/{field}', [MediaController::class, 'delete']);

        Route::get('cricket/dashboard-stats', CricketDashboardController::class);

        Route::get('tournament-requests', [TournamentRequestController::class, 'index']);
        Route::get('tournament-requests/{tournament_request}', [TournamentRequestController::class, 'show']);
        Route::match(['put', 'patch'], 'tournament-requests/{tournament_request}', [TournamentRequestController::class, 'update']);

        Route::get('interest-campaigns', [TournamentInterestCampaignController::class, 'index']);
        Route::post('interest-campaigns', [TournamentInterestCampaignController::class, 'store']);
        Route::get('interest-campaigns/{campaign}', [TournamentInterestCampaignController::class, 'show']);
        Route::match(['put', 'patch'], 'interest-campaigns/{campaign}', [TournamentInterestCampaignController::class, 'update']);
        Route::delete('interest-campaigns/{campaign}', [TournamentInterestCampaignController::class, 'destroy']);

        Route::get('interest-submissions', [TournamentInterestSubmissionController::class, 'index']);
        Route::get('interest-submissions/{submission}', [TournamentInterestSubmissionController::class, 'show']);
        Route::match(['put', 'patch'], 'interest-submissions/{submission}', [TournamentInterestSubmissionController::class, 'update']);

        Route::prefix('shop')->group(function () {
            Route::get('dashboard-stats', EcommerceDashboardController::class);
            Route::apiResource('brands', AdminBrandController::class);
            Route::apiResource('categories', AdminCategoryController::class);
            Route::apiResource('products', AdminProductController::class);
            Route::get('orders', [AdminOrderController::class, 'index']);
            Route::get('orders/{order}', [AdminOrderController::class, 'show']);
            Route::match(['put', 'patch'], 'orders/{order}', [AdminOrderController::class, 'update']);
        });
    });
});
