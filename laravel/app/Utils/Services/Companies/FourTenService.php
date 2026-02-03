<?php

namespace App\Utils\Services\Companies;

use App\Enums\Company\CompanyEnum;
use App\Models\Company;
use App\Models\Game;
use App\Models\Provider;
use App\Models\User;
use App\Models\UserGameSession;
use App\Utils\Services\Companies\Base\BaseCompanyService;
use App\Utils\Services\Utils;
use Illuminate\Support\Collection;

class FourTenService extends BaseCompanyService
{
    public function __construct()
    {
        parent::__construct(CompanyEnum::FOURTEN);
    }

    protected function getFieldsMappings(): Collection
    {
        return collect([
            'gameCode' => ['game_id', 'launch_identifier'], // FourTen's gameCode maps to our game_id
            'name' => 'name',                               // FourTen's name maps to our name
            'img' => 'image_url',                           // FourTen's img maps to our thumbnail
            'vendorCode' => 'sub_provider',                 // FourTen's vendorCode maps to sub_provider
        ]);
    }

    protected function fieldsMapper(?Provider $provider = null): array
    {
        return [
            'is_slot_game' => fn ($item) => str_contains(strtolower($provider->key), 'slot'),
        ];
    }

    public function syncVendors()
    {
        $url = '/v2/vendors';

        $headers = [
            'Authorization' => $this->getConfig('apiKey'),
        ];

        $params = [
            'site_code' => $this->getConfig('siteCode'),
        ];

        $response = $this->sendHttpRequest($url, $params, $headers, method: 'get');

        $providers = [];

        foreach ($response as $vendor) {
            $providers[] = [
                'name' => $vendor->name,
                'key' => $vendor->vendorCode,
                'status' => $vendor->status == 'Y',
            ];
        }

        $this->createProviders($this->company, collect($providers));
    }

    private function createProviders(Company $company, Collection $providers)
    {
        $providers->each(fn ($provider) => $this->createProvider($company, $provider['key'], $provider['name']));
    }

    private function createProvider(
        Company $company,
        string $key,
        string $name
    ): Provider {
        return Provider::updateOrCreate(
            ['key' => $key, 'company_id' => $company->id],
            ['name' => $name]
        );
    }

    protected function fetchGames(?Provider $provider = null): array
    {
        $url = '/v2/games';

        $headers = [
            'Authorization' => $this->getConfig('apiKey'),
        ];

        // Request parameters
        $params = [
            'site_code' => $this->getConfig('siteCode'),
            'vendorCode' => $provider->key, // Use the provider key as vendor code
        ];

        $response = $this->sendHttpRequest($url, $params, $headers, method: 'get');

        if ($response && is_array($response)) {
            return collect($response)->map(fn ($item) => (object) $item)
                ->values()
                ->toArray();
        }

        return [];
    }

    protected function generateLaunchUrl(UserGameSession $session, User $user, Game $game, string $language = 'en'): ?string
    {
        // Clover Game Launch API: GET /v2/play
        // Retrieves the connection URL for the requested game
        $url = '/v2/play';

        $headers = [
            'Authorization' => $this->getConfig('apiKey'),
        ];

        // Request parameters
        $params = [
            'site_code' => $this->getConfig('siteCode'),
            'user_id' => $session->user_id,
            'nickname' => $session->user?->username,
            'user_ip' => Utils::getClientIp(),
            'vendorCode' => $game->sub_provider ?: $game->provider->key,
            'gameCode' => $game->is_lobby_game ? 'lobby' : ($game->launch_identifier ?: $game->game_id),
            'session_token' => $session->token,
            // Optional parameters
            'lobby' => env('APP_URL'),
            'cashier' => env('APP_URL'),
        ];

        $response = $this->sendHttpRequest($url, $params, $headers, method: 'get');

        if (request()->has('debug') && auth()->user()->canDebug()) {
            dd(
                [
                    'url' => $url,
                    'request_params' => json_encode($params),
                    'request_headers' => json_encode($headers),
                    'response' => json_encode($response),
                ]
            );
        }

        // Response structure: { result: "OK/Error", url: "game_url" }
        if ($response && property_exists($response, 'result') && $response->result === 'OK') {
            if (property_exists($response, 'url')) {
                return $response->url;
            }
        }

        return null;
    }

    public function getRemainingBalance(): ?float
    {
        return 0;
    }
}
