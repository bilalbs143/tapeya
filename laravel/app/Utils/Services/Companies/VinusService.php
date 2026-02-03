<?php

namespace App\Utils\Services\Companies;

use App\Enums\Company\CompanyEnum;
use App\Enums\GameResultCard\GameResultCardStatusEnum;
use App\Enums\GameResultCard\GameResultCardTypeEnum;
use App\Models\Game;
use App\Models\Provider;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserGameSession;
use App\Utils\Services\Companies\Base\BaseCompanyService;
use App\Utils\Services\Utils;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class VinusService extends BaseCompanyService
{
    public function __construct()
    {
        parent::__construct(CompanyEnum::VINUS);
    }

    protected function getFieldsMappings(): Collection
    {
        return collect([
            'gameID' => ['game_id', 'launch_identifier'],
            'gameName' => 'name',
            'gameProvider' => 'sub_provider',
            'type' => 'type',
            'thumbnail' => 'thumbnail',
        ]);
    }

    protected function fieldsMapper(?Provider $provider = null): array
    {
        return [
            'is_live_game' => fn ($item) => $item->isLive ||
                (
                    ! $item->isSlot !== '1' &&
                    (
                        str_contains(strtolower($item->gameID), 'live') ||
                        str_contains(strtolower($item->gameName), 'live')
                    )
                ),
            'is_slot_game' => fn ($item) => $item->isSlot,
            'is_lobby_game' => function ($item) {
                if (in_array($item->gameID, [
                    '60i0lcfx5wkkv3sy',
                    '101',
                    '40',
                    'MX-LIVE-002',
                    'CA01',
                    '7953',
                    'BACCARAT',
                    'VGLobby_TNP',
                    'AB_1000',
                    'AB_0',
                    'vota',
                ])) {
                    if ($item->gameID === '60i0lcfx5wkkv3sy') {
                        return $item->gameProvider === 'evolution';
                    }

                    if ($item->gameID == '101') {
                        return $item->gameProvider === 'pragmatic_casino';
                    }

                    if ($item->gameID == '40') {
                        return $item->gameProvider === 'AGIN';
                    }

                    if ($item->gameID === 'MX-LIVE-002') {
                        return $item->gameProvider === 'SEXYBCRT';
                    }

                    if ($item->gameID === 'CA01') {
                        return $item->gameProvider === 'cq9_casino';
                    }

                    if ($item->gameID == '7953') {
                        return $item->gameProvider === 'MICRO_Casino';
                    }

                    if ($item->gameID === 'BACCARAT') {
                        return $item->gameProvider === 'taishan';
                    }

                    if ($item->gameID === 'VGLobby_TNP') {
                        return $item->gameProvider === 'TOMHORN_VIVO';
                    }

                    if ($item->gameID === 'AB_1000') {
                        return $item->gameProvider === 'TOMHORN_7Mojos';
                    }

                    if ($item->gameID === 'AB_0') {
                        return $item->gameProvider === 'TOMHORN_AbsoluteLive';
                    }

                    if ($item->gameID === 'vota') {
                        return $item->gameProvider === 'VOTA';
                    }
                }

                if ($item->gameProvider === 'MICRO_Casino') {
                    return true;
                }

                return false;
            },
            // 'is_new' => fn ($item) => $item->is_new === '1',
            // 'is_trending' => fn ($item) => $item->is_trending === '1',
            // 'is_video_slot' => fn ($item) => $item->is_video_slot === '1',
            // 'is_arcade_slot' => fn ($item) => $item->is_arcade_slot === '1',
            // 'is_casual_slot' => fn ($item) => $item->is_casual_slot === '1',
            // 'is_fishing_slot' => fn ($item) => $item->is_fishing_slot === '1',
            // 'is_table_slot' => fn ($item) => $item->is_table_slot === '1',
            // 'is_blackjack_casino' => fn ($item) => $item->is_blackjack_casino === '1',
            // 'is_baccarat_casino' => fn ($item) => $item->is_baccarat_casino === '1',
            // 'is_roulette_casino' => fn ($item) => $item->is_roulette_casino === '1',
            // 'is_poker' => fn ($item) => $item->is_poker === '1',
            // 'is_recommended' => fn ($item) => $item->is_recommended === '1',
            // 'is_sport' => fn ($item) => $item->is_sport === '1',
            'game_id_numeric' => fn ($item) => is_numeric($item->gameID) ? $item->gameID : null,
            'image_url' => fn ($item) => $item->thumbnail ?? null,
        ];
    }

    protected function fetchGames(?Provider $provider = null): array
    {
        $games = $this->sendHttpRequest('/game.txt', method: 'get');
        $providerTypes = $this->getProviderTypes();

        $gamesCollection = collect();

        foreach ($providerTypes as $providerName => $type) {
            if (! property_exists($games, $providerName)) {
                if ($this->isMicroCasino($providerName)) {
                    $games->{$providerName} = (object) [
                        $providerName => $this->getMicroCasinoGames(),
                    ];
                } else {
                    continue;
                }
            }

            $currentGames = (array) $games->{$providerName};

            $gameIds = array_keys($currentGames);

            foreach ($gameIds as $gameId) {
                try {
                    $currentGame = $currentGames[$gameId];
                    $game = [
                        'gameID' => $gameId,
                        'gameName' => isset($currentGame[2]) ? $currentGame[2] : null,
                        'gameProvider' => $providerName,
                        'thumbnail' => isset($currentGame[4]) ? $currentGame[4] : null,
                        'isLive' => $type === 'C',
                        'isSlot' => $type === 'S',
                        'type' => '',
                    ];
                    $gamesCollection->push($game);
                } catch (Exception $e) {
                    Log::error('Error During syncing vinus games', $e);
                }
            }
        }

        return collect($gamesCollection)->map(fn ($item) => (object) $item)
            ->filter(fn ($item) => strtolower($item->gameProvider) === strtolower($provider?->key))
            ->values()
            ->toArray();
    }

    public function isMicroCasino(string $providerName): bool
    {
        return $providerName === 'MICRO_Casino';
    }

    public function getMicroCasinoGames(): array
    {
        return [
            'MICRO_Casino',
            'MICRO_Casino',
            'Micro Casino',
            'Micro Casino',
            null,
        ];
    }

    private function getProviderTypes()
    {
        return [
            'evolution' => 'C',
            'pragmatic_casino' => 'C',
            'AGIN' => 'C',
            'SEXYBCRT' => 'C',
            'cq9_casino' => 'C',
            'MICRO_Casino' => 'C',
            'taishan' => 'C',
            'TOMHORN_VIVO' => 'C',
            'TOMHORN_7Mojos' => 'C',
            'TOMHORN_AbsoluteLive' => 'C',
            'VOTA' => 'C',
            'pragmatic_slot' => 'S',
            'PLAYNGO' => 'S',
            'MICRO_Slot' => 'S',
            'booongo' => 'S',
            'playson' => 'S',
            'cq9' => 'S',
            'habanero' => 'S',
            'netent' => 'S',
            'redtiger' => 'S',
            'TOMHORN_SLOT' => 'S',
            'patagonia' => 'S',
            'belatra' => 'S',
            'bfgames' => 'S',
            'conceptgaming' => 'S',
            'egp' => 'S',
            'evoplay' => 'S',
            'gameart' => 'S',
            'gmw' => 'S',
            'kagaming' => 'S',
            'legaplay' => 'S',
            'macaw' => 'S',
            'mplay' => 'S',
            'Njoy Gaming' => 'S',
            'onetouch' => 'S',
            'wazdan' => 'S',
            'wearecasino' => 'S',
            'gtf' => 'S',
            'spade' => 'S',
            'yellowbat' => 'S',
            'advantplay' => 'S',
            'askmeslot' => 'S',
            'bgaming' => 'S',
            'gpk7mj' => 'S',
            'booming' => 'S',
            'spinomenal' => 'S',
            'dbgame' => 'S',
            'live22' => 'S',
            'cg' => 'S',
            'thunderkick' => 'S',
            'evop' => 'S',
        ];
    }

    protected function generateLaunchUrl(UserGameSession $session, User $user, Game $game, string $language = 'en'): ?string
    {
        $key = $this->getConfig('apiKey');
        $url = '/game/play-game';

        $body = [
            'key' => $key,
            'token' => $session->token,
            'vendor' => $game->sub_provider,
            'platform' => 'WEB',
            'method' => 'seamless',
            'game' => $game->is_lobby_game ? 'lobby' : $game->launch_identifier,
        ];

        $response = $this->sendHttpRequest($url, $body, method: 'get');

        if ($response && $response->result === 0) {
            return $response->url;
        }

        return null;
    }

    public function saveResultCards(Transaction $transaction): void
    {
        $url = '/result/get';

        $body = [
            'auth' => [
                'api_key' => $this->getConfig('apiKey'),
            ],
            'request' => [
                'transaction_id' => $transaction->txn_id,
            ],
        ];
        $body['auth']['hash'] = Utils::getSortedHash($body['request'], md5($this->getConfig('secret')));

        $card = $this->createResultCard($transaction);
        $result = $this->sendHttpRequest($url, $body, isJson: true);

        if (
            $result &&
            property_exists($result, 'result')
        ) {
            $card->raw_data = $result;
            if (property_exists($result, 'type') && $result->type === 'url') {
                $card->type = GameResultCardTypeEnum::URL;
                $url = $result->result->url;
                $card->data = [
                    'url' => $url,
                ];
                $card->fetched_at = now();
                $card->status = GameResultCardStatusEnum::RESOLVED;
            }

            $card->save();

        } else {
            throw new Exception('Error in fetching antechip result card');
        }
    }

    public function getRemainingBalance(): ?float
    {
        return 0;
    }
}
