<?php

use App\Http\Controllers\v1\Admin\AgentController;
use App\Http\Controllers\v1\Admin\AnnouncementController;
use App\Http\Controllers\v1\Admin\AppReleaseController;
use App\Http\Controllers\v1\Admin\AuthenticationLogController;
use App\Http\Controllers\v1\Admin\BankAccountController;
use App\Http\Controllers\v1\Admin\BankController;
use App\Http\Controllers\v1\Admin\BlacklistedIpController;
use App\Http\Controllers\v1\Admin\CustomerInquiryController;
use App\Http\Controllers\v1\Admin\ExchangeRequestController;
use App\Http\Controllers\v1\Admin\FaqController;
use App\Http\Controllers\v1\Admin\GameController;
use App\Http\Controllers\v1\Admin\GameResultCardController;
use App\Http\Controllers\v1\Admin\MemberController;
use App\Http\Controllers\v1\Admin\MembershipCommissionSettingController;
use App\Http\Controllers\v1\Admin\NoteController;
use App\Http\Controllers\v1\Admin\NoteUserController;
use App\Http\Controllers\v1\Admin\PermissionController;
use App\Http\Controllers\v1\Admin\PopupController;
use App\Http\Controllers\v1\Admin\PromotionController;
use App\Http\Controllers\v1\Admin\PromotionProgressController;
use App\Http\Controllers\v1\Admin\ProviderController;
use App\Http\Controllers\v1\Admin\QuickAccountInquiryController;
use App\Http\Controllers\v1\Admin\RoleController;
use App\Http\Controllers\v1\Admin\Settlements\DailySettlementsController;
use App\Http\Controllers\v1\Admin\Settlements\MonthlyCumulativeSettlementsController;
use App\Http\Controllers\v1\Admin\Settlements\MonthlySettlementsController;
use App\Http\Controllers\v1\Admin\Settlements\UserDailySettlementsController;
use App\Http\Controllers\v1\Admin\Settlements\UserMonthlyCumulativeSettlementsController;
use App\Http\Controllers\v1\Admin\SoundController;
use App\Http\Controllers\v1\Admin\SoundSettingsController;
use App\Http\Controllers\v1\Admin\StatsController;
use App\Http\Controllers\v1\Admin\SystemController;
use App\Http\Controllers\v1\Admin\SystemSettingController;
use App\Http\Controllers\v1\Admin\TemplateController;
use App\Http\Controllers\v1\Admin\TransactionController;
use App\Http\Controllers\v1\Admin\TransactionResultController;
use App\Http\Controllers\v1\Admin\UserController;
use App\Http\Controllers\v1\Admin\WhitelistedIpController;
use App\Utils\Services\RolesService;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Middleware\PermissionMiddleware;

Route::prefix('users')->group(function () {
    Route::get('/{user}', [UserController::class, 'show'])->middleware(PermissionMiddleware::using(RolesService::getPermissions('VIEW_AGENT', 'VIEW_MEMBER')));
    Route::patch('/{user}', [UserController::class, 'patch'])->middleware(PermissionMiddleware::using(RolesService::getPermissions('UPDATE_AGENT', 'UPDATE_MEMBER')));
    Route::patch('/{user}/sync', [UserController::class, 'syncPermissions'])->can(RolesService::getPermission('SYNC_USER_PERMISSIONS'));
});

Route::prefix('agents')->group(function () {
    Route::get('/', [AgentController::class, 'index'])->can(RolesService::getPermission('VIEW_AGENTS'));
    Route::get('/hierarchy', [AgentController::class, 'hierarchy'])->can(RolesService::getPermission('VIEW_AGENT_HIERARCHY'));
    Route::get('/{agent}', [AgentController::class, 'show'])->can(RolesService::getPermission('VIEW_AGENT'));
    Route::post('/', [AgentController::class, 'store'])->can(RolesService::getPermission('CREATE_AGENT'));
    Route::put('/{agent}', [AgentController::class, 'update'])->can(RolesService::getPermission('UPDATE_AGENT'));
    Route::patch('/{agent}', [AgentController::class, 'patch'])->can(RolesService::getPermission('UPDATE_AGENT'));
    Route::delete('/{agent}', [AgentController::class, 'destroy'])->can(RolesService::getPermission('DELETE_AGENT'));
});

Route::prefix('members')->group(function () {
    Route::get('/', [MemberController::class, 'index'])->can(RolesService::getPermission('VIEW_MEMBERS'));
    Route::get('/users-with-referrals', [MemberController::class, 'usersWithReferrals'])->can(RolesService::getPermission('VIEW_MEMBERS'));
    Route::get('/{member}', [MemberController::class, 'show'])->can(RolesService::getPermission('VIEW_MEMBER'));
    Route::get('/{member}/referred-users', [MemberController::class, 'referredUsers'])->can(RolesService::getPermission('VIEW_MEMBER'));
    Route::patch('/{member}', [MemberController::class, 'patch'])->can(RolesService::getPermission('UPDATE_MEMBER'));
});

Route::prefix('authentication')->group(function () {
    Route::get('/login/history', [AuthenticationLogController::class, 'loginHistory'])->can(RolesService::getPermission('VIEW_LOGIN_HISTORY'));
    Route::get('/login/current', [AuthenticationLogController::class, 'currentSessions'])->can(RolesService::getPermission('VIEW_CURRENT_SESSIONS'));
    Route::delete('/login/current/{id}/kill', [AuthenticationLogController::class, 'killSession'])->can(RolesService::getPermission('KILL_CURRENT_SESSION'));
});

Route::prefix('transactions')->group(function () {
    Route::prefix('requests')->group(function () {
        Route::get('/', [ExchangeRequestController::class, 'index'])->can(RolesService::getPermission('VIEW_EXCHANGE_REQUESTS'));
        Route::get('/{id}', [ExchangeRequestController::class, 'show'])->can(RolesService::getPermission('VIEW_EXCHANGE_REQUEST'));
        Route::post('/{exchangeRequest}/approve', [ExchangeRequestController::class, 'approve'])->can(RolesService::getPermission('APPROVE_EXCHANGE_REQUEST'));
        Route::post('/{exchangeRequest}/reject', [ExchangeRequestController::class, 'reject'])->can(RolesService::getPermission('REJECT_EXCHANGE_REQUEST'));
    });

    Route::get('/', [TransactionController::class, 'index'])->can(RolesService::getPermission('VIEW_TRANSACTIONS'));
    Route::get('/categories', [TransactionController::class, 'getCategories']);
    Route::post('/{user}/pay', [TransactionController::class, 'pay'])->can(RolesService::getPermission('PAY'));

    Route::prefix('bets')->group(function () {
        Route::get('/history', [TransactionResultController::class, 'index'])->can(RolesService::getPermission('VIEW_BETS_HISTORY'));
    });
});

Route::prefix('templates')->group(function () {
    Route::get('/', [TemplateController::class, 'index'])->can(RolesService::getPermission('VIEW_TEMPLATES'));
    Route::get('/{template}', [TemplateController::class, 'show'])->can(RolesService::getPermission('VIEW_TEMPLATE'));
    Route::post('/', [TemplateController::class, 'store'])->can(RolesService::getPermission('CREATE_TEMPLATE'));
    Route::patch('/{template}', [TemplateController::class, 'patch'])->can(RolesService::getPermission('UPDATE_TEMPLATE'));
    Route::delete('/{template}', [TemplateController::class, 'destroy'])->can(RolesService::getPermission('DELETE_TEMPLATE'));
});

Route::prefix('faqs')->group(function () {
    Route::get('/', [FaqController::class, 'index'])->can(RolesService::getPermission('VIEW_FAQS'));
    Route::get('/categories', [FaqController::class, 'getCategories']);
    Route::get('/{faq}', [FaqController::class, 'show'])->can(RolesService::getPermission('VIEW_FAQ'));
    Route::post('/', [FaqController::class, 'store'])->can(RolesService::getPermission('CREATE_FAQ'));
    Route::patch('/{faq}', [FaqController::class, 'patch'])->can(RolesService::getPermission('UPDATE_FAQ'));
    Route::delete('/{faq}', [FaqController::class, 'destroy'])->can(RolesService::getPermission('DELETE_FAQ'));
});

Route::prefix('announcements')->group(function () {
    Route::get('/', [AnnouncementController::class, 'index'])->can(RolesService::getPermission('VIEW_ANNOUNCEMENTS'));
    Route::get('/categories', [AnnouncementController::class, 'getCategories']);
    Route::get('/important', [AnnouncementController::class, 'getImportant'])->can(RolesService::getPermission('VIEW_ANNOUNCEMENT'));
    Route::get('/{announcement}', [AnnouncementController::class, 'show'])->can(RolesService::getPermission('VIEW_ANNOUNCEMENT'));
    Route::post('/', [AnnouncementController::class, 'store'])->can(RolesService::getPermission('CREATE_ANNOUNCEMENT'));
    Route::patch('/{announcement}', [AnnouncementController::class, 'patch'])->can(RolesService::getPermission('UPDATE_ANNOUNCEMENT'));
    Route::delete('/{announcement}', [AnnouncementController::class, 'destroy'])->can(RolesService::getPermission('DELETE_ANNOUNCEMENT'));
});

Route::prefix('quick-account-inquiries')->group(function () {
    Route::get('/', [QuickAccountInquiryController::class, 'index'])->can(RolesService::getPermission('VIEW_QUICK_ACCOUNT_INQUIRIES'));
    Route::get('/{quickAccountInquiry}', [QuickAccountInquiryController::class, 'show'])->can(RolesService::getPermission('VIEW_QUICK_ACCOUNT_INQUIRY'));
    Route::delete('/{quickAccountInquiry}', [QuickAccountInquiryController::class, 'destroy'])->can(RolesService::getPermission('DELETE_QUICK_ACCOUNT_INQUIRY'));
});

Route::prefix('customer-inquiries')->group(function () {
    Route::get('/', [CustomerInquiryController::class, 'index'])->can(RolesService::getPermission('VIEW_CUSTOMER_INQUIRIES'));
    Route::get('/{customerInquiry}', [CustomerInquiryController::class, 'show'])->can(RolesService::getPermission('VIEW_CUSTOMER_INQUIRY'));
    Route::post('/{customerInquiry}/reply', [CustomerInquiryController::class, 'reply'])->can(RolesService::getPermission('REPLY_TO_CUSTOMER_INQUIRY'));
    Route::delete('/{customerInquiry}', [CustomerInquiryController::class, 'destroy'])->can(RolesService::getPermission('DELETE_CUSTOMER_INQUIRY'));
});

Route::prefix('popups')->group(function () {
    Route::get('/', [PopupController::class, 'index'])->can(RolesService::getPermission('VIEW_POPUPS'));
    Route::get('/{popup}', [PopupController::class, 'show'])->can(RolesService::getPermission('VIEW_POPUP'));
    Route::post('/', [PopupController::class, 'store'])->can(RolesService::getPermission('CREATE_POPUP'));
    Route::patch('/{popup}', [PopupController::class, 'patch'])->can(RolesService::getPermission('UPDATE_POPUP'));
    Route::delete('/{popup}', [PopupController::class, 'destroy'])->can(RolesService::getPermission('DELETE_POPUP'));
});

Route::prefix('notes')->group(function () {
    Route::get('/', [NoteController::class, 'index'])->can(RolesService::getPermission('VIEW_NOTES'));
    Route::get('/categories', [NoteController::class, 'getCategories']);
    Route::get('/{note}', [NoteController::class, 'show'])->can(RolesService::getPermission('VIEW_NOTE'));
    Route::post('/', [NoteController::class, 'store'])->can(RolesService::getPermission('CREATE_NOTE'));
    Route::delete('/{note}', [NoteController::class, 'destroy'])->can(RolesService::getPermission('DELETE_NOTE'));
});

Route::prefix('note/users')->group(function () {
    Route::get('/', [NoteUserController::class, 'index'])->can(RolesService::getPermission('VIEW_NOTES'));
    Route::get('/{noteUser}', [NoteUserController::class, 'show'])->can(RolesService::getPermission('VIEW_NOTES'));
    Route::delete('/{noteUser}', [NoteUserController::class, 'destroy'])->can(RolesService::getPermission('DELETE_NOTE'));
});

Route::prefix('blacklisted-ips')->group(function () {
    Route::get('/', [BlacklistedIpController::class, 'index'])->can(RolesService::getPermission('VIEW_BLACKLISTED_IPS'));
    Route::get('/{blacklistedIp}', [BlacklistedIpController::class, 'show'])->can(RolesService::getPermission('VIEW_BLACKLISTED_IP'));
    Route::post('/', [BlacklistedIpController::class, 'store'])->can(RolesService::getPermission('CREATE_BLACKLISTED_IP'));
    Route::patch('/{blacklistedIp}', [BlacklistedIpController::class, 'patch'])->can(RolesService::getPermission('UPDATE_BLACKLISTED_IP'));
    Route::delete('/{blacklistedIp}', [BlacklistedIpController::class, 'destroy'])->can(RolesService::getPermission('DELETE_BLACKLISTED_IP'));
});

Route::prefix('whitelisted-ips')->group(function () {
    Route::get('/', [WhitelistedIpController::class, 'index'])->can(RolesService::getPermission('VIEW_WHITELISTED_IPS'));
    Route::get('/{whitelistedIp}', [WhitelistedIpController::class, 'show'])->can(RolesService::getPermission('VIEW_WHITELISTED_IP'));
    Route::post('/', [WhitelistedIpController::class, 'store'])->can(RolesService::getPermission('CREATE_WHITELISTED_IP'));
    Route::patch('/{whitelistedIp}', [WhitelistedIpController::class, 'patch'])->can(RolesService::getPermission('UPDATE_WHITELISTED_IP'));
    Route::delete('/{whitelistedIp}', [WhitelistedIpController::class, 'destroy'])->can(RolesService::getPermission('DELETE_WHITELISTED_IP'));
});

Route::prefix('sounds')->group(function () {
    Route::get('/', [SoundController::class, 'index'])->can(RolesService::getPermission('VIEW_SOUNDS'));
    Route::get('/{sound}', [SoundController::class, 'show'])->can(RolesService::getPermission('VIEW_SOUND'));
    Route::post('/', [SoundController::class, 'store'])->can(RolesService::getPermission('CREATE_SOUND'));
    Route::patch('/{sound}', [SoundController::class, 'patch'])->can(RolesService::getPermission('UPDATE_SOUND'));
    Route::delete('/{sound}', [SoundController::class, 'destroy'])->can(RolesService::getPermission('DELETE_SOUND'));
});

Route::prefix('sound-settings')->group(function () {
    Route::get('/', [SoundSettingsController::class, 'index'])->can(RolesService::getPermission('VIEW_SOUND_SETTINGS'));
    Route::get('/types', [SoundSettingsController::class, 'getTypes']);
    Route::get('/{soundSetting}', [SoundSettingsController::class, 'show'])->can(RolesService::getPermission('VIEW_SOUND_SETTING'));
    Route::post('/', [SoundSettingsController::class, 'store'])->can(RolesService::getPermission('CREATE_SOUND_SETTING'));
    Route::patch('/{soundSetting}', [SoundSettingsController::class, 'patch'])->can(RolesService::getPermission('UPDATE_SOUND_SETTING'));
    Route::delete('/{soundSetting}', [SoundSettingsController::class, 'destroy'])->can(RolesService::getPermission('DELETE_SOUND_SETTING'));
});

Route::prefix('promotions')->group(function () {
    Route::get('/', [PromotionController::class, 'index']);
    Route::get('/types', [PromotionController::class, 'getTypes']);
    Route::get('/{promotion}', [PromotionController::class, 'show']);
    Route::post('/', [PromotionController::class, 'store']);
    Route::patch('/{promotion}', [PromotionController::class, 'patch']);
    Route::delete('/{promotion}', [PromotionController::class, 'destroy']);
});

Route::prefix('promotion-progress')->group(function () {
    Route::get('/', [PromotionProgressController::class, 'index']);
    Route::get('/{promotionProgress}', [PromotionProgressController::class, 'show']);
});

Route::prefix('membership-level-commission-settings')->group(function () {
    Route::get('/', [MembershipCommissionSettingController::class, 'index'])->can(RolesService::getPermission('VIEW_MEMBERSHIP_COMMISSION_SETTINGS'));
    Route::patch('/', [MembershipCommissionSettingController::class, 'patch'])->can(RolesService::getPermission('UPDATE_MEMBERSHIP_COMMISSION_SETTING'));
});

Route::prefix('system-settings')->group(function () {
    Route::get('/', [SystemSettingController::class, 'index'])->can(RolesService::getPermission('VIEW_SYSTEM_SETTINGS'));
    Route::get('/{key}', [SystemSettingController::class, 'show'])->can(RolesService::getPermission('VIEW_SYSTEM_SETTING'));
    Route::patch('/{systemSetting}', [SystemSettingController::class, 'patch'])->can(RolesService::getPermission('UPDATE_SYSTEM_SETTING'));
});

Route::prefix('system')->group(function () {
    Route::withoutMiddleware('auth:api')->withoutMiddleware('whitelisted_ip.verify')->group(function () {
        Route::get('/info', [SystemController::class, 'info']);
    });
});

Route::prefix('stats')->group(function () {
    Route::get('requests/counter/{period?}', [StatsController::class, 'requestsCounter'])->can(RolesService::getPermission('STATS_GET_REQUESTS_COUNTER'));
    Route::get('requests/{period?}', [StatsController::class, 'requests'])->can(RolesService::getPermission('STATS_GET_REQUESTS'));
    Route::get('activities/{period?}', [StatsController::class, 'activities'])->can(RolesService::getPermission('STATS_GET_ACTIVITIES'));
    Route::get('calculations', [StatsController::class, 'calculations'])->can(RolesService::getPermission('STATS_GET_CALCULATIONS'));
    Route::get('user-calculations/{id?}', [StatsController::class, 'userCalculations']);
});

Route::prefix('providers')->group(function () {
    Route::get('/', [ProviderController::class, 'index'])->can(RolesService::getPermission('VIEW_PROVIDERS'));
    Route::get('/{provider}', [ProviderController::class, 'show'])->can(RolesService::getPermission('VIEW_PROVIDER'));
    Route::patch('/{provider}', [ProviderController::class, 'patch'])->can(RolesService::getPermission('UPDATE_PROVIDER'));
});

Route::prefix('settlements')->group(function () {
    Route::prefix('daily')->group(function () {
        Route::get('/get', [DailySettlementsController::class, 'get'])->middleware(PermissionMiddleware::using(RolesService::getPermissions('VIEW_DAILY_SETTLEMENTS', 'VIEW_USER_DAILY_SETTLEMENTS')));

        Route::get('/', [DailySettlementsController::class, 'index'])->can(RolesService::getPermission('VIEW_DAILY_SETTLEMENTS'));
        Route::get('/user', [UserDailySettlementsController::class, 'index'])->can(RolesService::getPermission('VIEW_USER_DAILY_SETTLEMENTS'));
    });
    Route::prefix('monthly')->group(function () {
        Route::get('/get', [MonthlySettlementsController::class, 'get'])->middleware(PermissionMiddleware::using(RolesService::getPermissions('VIEW_MONTHLY_SETTLEMENTS', 'VIEW_USER_MONTHLY_SETTLEMENTS')));

        Route::get('/', [MonthlyCumulativeSettlementsController::class, 'index'])->can(RolesService::getPermission('VIEW_MONTHLY_SETTLEMENTS'));
        Route::get('/user', [UserMonthlyCumulativeSettlementsController::class, 'index'])->can(RolesService::getPermission('VIEW_USER_MONTHLY_SETTLEMENTS'));
    });
});

Route::prefix('games')->group(function () {
    Route::get('/', [GameController::class, 'index'])->can(RolesService::getPermission('VIEW_GAMES'));
    Route::get('/{game}', [GameController::class, 'show'])->can(RolesService::getPermission('VIEW_GAME'));
});

Route::prefix('game-result-cards')->group(function () {
    Route::get('/', [GameResultCardController::class, 'index'])->can(RolesService::getPermission('VIEW_GAME_RESULT_CARDS'));
    Route::get('/{gameResultCard}', [GameResultCardController::class, 'show'])->can(RolesService::getPermission('VIEW_GAME_RESULT_CARD'));
});

Route::prefix('banks')->group(function () {
    Route::get('/', [BankController::class, 'index'])->can(RolesService::getPermission('VIEW_BANKS'));
    Route::get('/{bank}', [BankController::class, 'show'])->can(RolesService::getPermission('VIEW_BANK'));
    Route::post('/', [BankController::class, 'store'])->can(RolesService::getPermission('CREATE_BANK'));
    Route::patch('/{bank}', [BankController::class, 'patch'])->can(RolesService::getPermission('UPDATE_BANK'));
    Route::delete('/{bank}', [BankController::class, 'destroy'])->can(RolesService::getPermission('DELETE_BANK'));
});

Route::prefix('bank-accounts')->group(function () {
    Route::get('/', [BankAccountController::class, 'index'])->can(RolesService::getPermission('VIEW_BANK_ACCOUNTS'));
    Route::get('/{bankAccount}', [BankAccountController::class, 'show'])->can(RolesService::getPermission('VIEW_BANK_ACCOUNT'));
    Route::post('/', [BankAccountController::class, 'store'])->can(RolesService::getPermission('CREATE_BANK_ACCOUNT'));
    Route::post('/{bankAccount}', [BankAccountController::class, 'patch'])->can(RolesService::getPermission('UPDATE_BANK_ACCOUNT'));
    Route::delete('/{bankAccount}', [BankAccountController::class, 'destroy'])->can(RolesService::getPermission('DELETE_BANK_ACCOUNT'));
});

Route::prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->can(RolesService::getPermission('VIEW_ROLES'));
    Route::get('/{role}', [RoleController::class, 'show'])->can(RolesService::getPermission('VIEW_ROLE'));
    Route::patch('/{role}/sync', [RoleController::class, 'syncPermissions'])->can(RolesService::getPermission('SYNC_ROLE_PERMISSIONS'));
});

Route::prefix('permissions')->group(function () {
    Route::get('/view-property-permissions', [PermissionController::class, 'viewPropertyPermissions'])->can(RolesService::getPermission('VIEW_VIEW_PROPERTY_PERMISSIONS'));
});

Route::prefix('app-releases')->group(function () {
    Route::post('/', [AppReleaseController::class, 'store'])->can(RolesService::getPermission('CREATE_APP_RELEASE'));
});
