<?php

namespace App\Console\Commands;

use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Settings\StreamingSettings;
use Google\Client as GoogleClient;
use Google\Service\YouTube;
use Illuminate\Console\Command;

class YouTubeAuthorize extends Command
{
    protected $signature = 'youtube:authorize';

    protected $description = 'Complete one-time OAuth2 flow and save refresh token to System Settings';

    public function handle(): int
    {
        $settings = app(StreamingSettings::class);

        if (! $settings->youtubeClientId || ! $settings->youtubeClientSecret) {
            $this->error('Set YouTube Client ID and Client Secret in Admin → System Settings → Live Streaming first.');

            return self::FAILURE;
        }

        $redirectUri = StreamingSettings::OAUTH_REDIRECT_URI;

        $client = new GoogleClient;
        $client->setClientId($settings->youtubeClientId);
        $client->setClientSecret($settings->youtubeClientSecret);
        $client->addScope(YouTube::YOUTUBE);
        $client->setRedirectUri($redirectUri);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        $this->line('Google Cloud → Credentials → your Web client → Authorized redirect URIs must include:');
        $this->line("  {$redirectUri}");
        $this->line('');
        $this->line('Open this URL and authorize the Tapeya YouTube account:');
        $this->line('');
        $this->line($client->createAuthUrl());
        $this->line('');
        $this->line('After sign-in, the browser redirects to localhost (connection error is normal).');
        $this->line('Copy the `code` query parameter from the address bar, e.g. http://localhost/?code=4/0A...');
        $this->line('');

        $code = $this->ask('Paste the authorization code here');
        $token = $client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            $this->error('Authorization failed: '.($token['error_description'] ?? $token['error']));

            return self::FAILURE;
        }

        SystemSettingKeyEnum::STREAM_YOUTUBE_REFRESH_TOKEN->write($token['refresh_token']);

        $this->info('Refresh token saved to System Settings.');
        $this->line('Next: set your YouTube Channel ID in Admin → System Settings → Live Streaming.');

        return self::SUCCESS;
    }
}
