<?php

namespace Database\Seeders;

use App\Settings\AdminNotificationSettings;
use App\Settings\AppStoreSettings;
use App\Settings\ContactSettings;
use App\Settings\GeneralSettings;
use App\Settings\GraphicsSettings;
use App\Settings\LiveChatSettings;
use App\Settings\MediaCdnSettings;
use App\Settings\OtpSettings;
use App\Settings\PostsSettings;
use App\Settings\PushSettings;
use App\Settings\SmsSettings;
use App\Settings\StreamingSettings;
use App\Settings\VeevoTechSmsSettings;
use App\Settings\WhatsAppSettings;
use App\Support\EnsureSpatieSettingsDatabaseProperties;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        EnsureSpatieSettingsDatabaseProperties::ensure();

        $this->seedGeneral();
        $this->seedAppStore();
        $this->seedContact();
        $this->seedAdminNotification();
        $this->seedGraphics();
        $this->seedOtp();
        $this->seedSms();
        $this->seedVeevoTechSms();
        $this->seedWhatsApp();
        $this->seedStreaming();
        $this->seedLiveChat();
        $this->seedPush();
        $this->seedReels();
        $this->seedMediaCdn();
    }

    private function seedGeneral(): void
    {
        $general = app(GeneralSettings::class);
        if (! isset($general->currency) || $general->currency === '') {
            $general->currency = 'PKR';
        }
        if (! isset($general->timezone) || $general->timezone === '') {
            $general->timezone = 'Asia/Karachi';
        }
        $general->save();
    }

    private function seedAppStore(): void
    {
        $appStore = app(AppStoreSettings::class);
        $appStore->iosStoreUrl ??= 'https://apps.apple.com/pk/app/tapeya/id6762375075';
        $appStore->androidStoreUrl ??= 'https://play.google.com/store/apps/details?id=com.tapbytapeya.app';
        $appStore->iosVersion ??= null;
        $appStore->androidVersion ??= null;
        $appStore->save();
    }

    private function seedContact(): void
    {
        $contact = app(ContactSettings::class);
        $contact->supportEmail ??= 'hello@tapeya.com';
        $contact->supportPhone ??= '+923001238832';
        $contact->publicWebsiteUrl ??= 'https://tapeya.com';
        $contact->save();
    }

    private function seedAdminNotification(): void
    {
        $adminNotification = app(AdminNotificationSettings::class);
        if (empty($adminNotification->adminEmails)) {
            $adminNotification->adminEmails = ['hello@tapeya.com'];
        }
        $adminNotification->save();
    }

    private function seedGraphics(): void
    {
        $graphics = app(GraphicsSettings::class);
        $graphics->frontendUrl ??= 'http://localhost:5180';
        $graphics->defaultTtlSeconds ??= 86400;
        $graphics->signingSecret ??= '563b165330a2a1b96d0f9b7172182ef0e0b3480f276eacc6b55ad99c038489e4';
        $graphics->save();
    }

    private function seedOtp(): void
    {
        $otp = app(OtpSettings::class);
        if (empty($otp->testPhoneNumbers)) {
            $otp->testPhoneNumbers = ['+923216516130'];
        }
        $otp->save();
    }

    private function seedSms(): void
    {
        $sms = app(SmsSettings::class);
        $sms->driver ??= 'log';
        $sms->otpMessage ??= 'Your verification code is :code. Do not share this code with anyone.';
        $sms->save();
    }

    private function seedVeevoTechSms(): void
    {
        $veevotech = app(VeevoTechSmsSettings::class);
        $veevotech->from ??= 'Default';
        $veevotech->veevotechApiUrl ??= 'https://api.veevotech.com/v3/sendsms';
        $veevotech->veevotechApiKey ??= null;
        $veevotech->save();
    }

    private function seedWhatsApp(): void
    {
        $whatsApp = app(WhatsAppSettings::class);
        $whatsApp->phoneNumberId ??= null;
        $whatsApp->accessToken ??= null;
        $whatsApp->apiVersion ??= 'v25.0';
        $whatsApp->baseUrl ??= 'https://graph.facebook.com';
        $whatsApp->authTemplateName ??= 'otp';
        $whatsApp->authTemplateLanguage ??= 'en_US';
        $whatsApp->save();
    }

    private function seedStreaming(): void
    {
        $streaming = app(StreamingSettings::class);
        if (! isset($streaming->defaultProvider) || $streaming->defaultProvider === '') {
            $streaming->defaultProvider = 'youtube';
        }
        $streaming->youtubeClientId ??= null;
        $streaming->youtubeClientSecret ??= null;
        $streaming->youtubeRefreshToken ??= null;
        $streaming->youtubeChannelId ??= null;
        $streaming->youtubeDefaultPrivacy ??= 'public';
        $streaming->idleEndGraceMinutes ??= 120;
        $streaming->concurrentBroadcastAlertThreshold ??= 3;
        $streaming->dailyYoutubeQuotaBudget ??= 10000;
        $streaming->quotaAlertThresholdPercent ??= 80;
        $streaming->save();
    }

    private function seedLiveChat(): void
    {
        $chat = app(LiveChatSettings::class);
        $chat->enabled ??= 1;
        $chat->minIntervalSec ??= 2;
        $chat->burstMax ??= 20;
        $chat->burstWindowSec ??= 600;
        $chat->bodyMax ??= 200;
        $chat->save();
    }

    private function seedPush(): void
    {
        $push = app(PushSettings::class);
        $push->enabled ??= 0;
        $push->provider ??= 'fcm';
        $push->fcmProjectId ??= null;
        $push->fcmServiceAccountJson ??= null;
        $push->save();
    }

    private function seedReels(): void
    {
        $reels = app(PostsSettings::class);
        $reels->maxDurationSeconds ??= 0;
        $reels->minDurationSeconds ??= 0;
        $reels->maxUploadMb ??= 0;
        $reels->hlsSegmentSeconds ??= 2;
        $reels->viewMinWatchedMs ??= 3000;
        $reels->viewMinCompletionRatePercent ??= 25;
        $reels->viewAllowAnonymous ??= 0;
        $reels->viewRedisBuffer ??= 1;
        $reels->multipartPartSizeMb ??= 1;
        $reels->multipartMaxParts ??= 0;
        $reels->autoEngagementEnabled ??= 0;
        $reels->reelsEngagementPerDay ??= 10;
        $reels->simplePostLikesPerDay ??= 8;
        $reels->save();
    }

    private function seedMediaCdn(): void
    {
        $cdn = app(MediaCdnSettings::class);
        $cdn->cdnPublicBaseUrl ??= null;
        $cdn->save();
    }
}
