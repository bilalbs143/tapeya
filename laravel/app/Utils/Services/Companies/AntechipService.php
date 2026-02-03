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

class AntechipService extends BaseCompanyService
{
    public function __construct()
    {
        parent::__construct(CompanyEnum::ANTECHIP);
    }

    protected function getFieldsMappings(): Collection
    {
        return collect([
            'id' => ['game_id', 'launch_identifier'],
            'name' => 'name',
            'sub_provider' => 'sub_provider',
            'type' => 'type',
            'description' => 'description',
            'is_live_game' => 'is_live_game',
            'has_freespins' => 'has_freespins',
            'has_jackpot' => 'has_jackpot',
            'is_slot_game' => 'is_slot_game',
            'is_demo_game_available' => 'is_demo_game_available',
            'is_new' => 'is_new',
            'is_trending' => 'is_trending',
            'is_video_slot' => 'is_video_slot',
            'is_arcade_slot' => 'is_arcade_slot',
            'is_casual_slot' => 'is_casual_slot',
            'is_fishing_slot' => 'is_fishing_slot',
            'is_table_slot' => 'is_table_slot',
            'is_blackjack_casino' => 'is_blackjack_casino',
            'is_baccarat_casino' => 'is_baccarat_casino',
            'is_roulette_casino' => 'is_roulette_casino',
            'is_poker' => 'is_poker',
            'is_recommended' => 'is_recommended',
            'is_sport' => 'is_sport',
            'is_lobby_game' => 'is_lobby_game',
            'image' => 'image_url',
        ]);
    }

    protected function fieldsMapper(?Provider $provider = null): array
    {
        return [
            'company_name' => fn ($item) => $item?->provider?->company,
        ];
    }

    protected function fetchRecursiveGames($currentPage = 1, &$allGames = [], ?string $providerKey = null): array
    {
        $url = "/games/get?page={$currentPage}";
        $perPage = 1000;

        $body = [
            'auth' => [
                'api_key' => $this->getConfig('apiKey'),
            ],
            'request' => [
                'perPage' => $perPage,
                'provider' => $providerKey,
            ],
        ];

        $body['auth']['hash'] = Utils::getSortedHash($body['request'], md5($this->getConfig('secret')));
        $result = $this->sendHttpRequest($url, $body, isJson: true);

        info('Antechip Games', ['providerKey' => $providerKey, 'result' => count($result->data), 'provider' => $providerKey]);

        // if($providerKey === 'v_MICRO_Slot') {
        //     dd($result);
        // }

        if ($result && $result->data) {
            $allGames = [...$allGames, ...$result->data];

            if ($currentPage < $result->meta->last_page) {
                $this->fetchRecursiveGames($currentPage + 1, $allGames, $providerKey);
            }
        }

        return $allGames;
    }

    protected function fetchGames(?Provider $provider = null): array
    {
        $allGames = $this->fetchRecursiveGames(providerKey: $provider?->key);

        return $allGames;
    }

    protected function generateLaunchUrl(UserGameSession $session, User $user, Game $game, string $language = 'en'): ?string
    {
        $url = '/games/url/launch';

        $body = [
            'auth' => [
                'api_key' => $this->getConfig('apiKey'),
            ],
            'user_info' => [
                'username' => $user->username,
                'token' => $session->token,
            ],
            'request' => [
                'game_id' => $game->launch_identifier,
                'lobby_url' => env('APP_URL'),
            ],
        ];

        $body['auth']['hash'] = Utils::getSortedHash($body['request'], md5($this->getConfig('secret')));
        $result = $this->sendHttpRequest($url, $body, isJson: true);

        if ($result && $result->launch_url) {
            return $result->launch_url;
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
        $url = '/limit/get';

        $body = [
            'auth' => [
                'api_key' => $this->getConfig('apiKey'),
            ],
            'request' => [],
        ];
        $body['auth']['hash'] = Utils::getSortedHash($body['request'], md5($this->getConfig('secret')));
        $result = $this->sendHttpRequest($url, $body, isJson: true);

        if ($result && property_exists($result, 'remaining_limit')) {
            return $result->remaining_limit;
        }

        return 0;
    }
}
