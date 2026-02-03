<?php

namespace App\Utils\Services\Companies;

use App\Enums\Company\CompanyEnum;
use App\Enums\GameResultCard\GameResultCardStatusEnum;
use App\Enums\GameResultCard\GameResultCardTypeEnum;
use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Models\Game;
use App\Models\Provider;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserGameSession;
use App\Utils\Services\Companies\Base\BaseCompanyService;
use App\Utils\Services\Utils;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TheBigHitService extends BaseCompanyService
{
    public function __construct()
    {
        parent::__construct(CompanyEnum::THEBIGHIT);
    }

    protected function getFieldsMappings(): Collection
    {
        return collect([
            'game_id' => ['game_id', 'launch_identifier'],
            'game_name' => 'name',
        ]);
    }

    protected function fieldsMapper(?Provider $provider = null): array
    {
        return [
            'is_slot_game' => true,
            'game_id_numeric' => fn ($item) => is_numeric($item->game_id) ? $item->game_id : null,
            'image_url' => function ($item) {
                $thumbnail = null;

                if (property_exists($item, 'thumbnail')) {
                    $thumbnail = $item->thumbnail;

                    if (property_exists($thumbnail, '100x100')) {
                        $thumbnail = $thumbnail->{'100x100'};
                    } else {
                        $thumbnailKey = collect($thumbnail)->keys()->first();
                        $thumbnail = $thumbnail->{$thumbnailKey};
                    }
                }

                return $thumbnail;
            },
        ];
    }

    protected function fetchGames(?Provider $provider = null): array
    {
        $body = [
            'platform_type' => $this->getConfig('apiKey'),
            'requestid' => Str::random(),
            'lang' => 'EN',
        ];

        $body['signature'] = md5("{$this->getConfig('secret')}#{$body['requestid']}");
        $response = $this->sendHttpRequest('/api/gamelist', $body);

        if ($response->result === TheBigHitStatusCode::NO_ERROR->id()) {
            return $response->slots;
        }

        return [];
    }

    protected function generateLaunchUrl(UserGameSession $session, User $user, Game $game, string $language = 'en'): ?string
    {
        if (! isset($game->game['game_path'])) {
            return null;
        }

        $key = $this->getConfig('apiKey');
        $queryParams = [
            'platform' => $key,
            'token' => $session->token,
            'lang' => $language,
        ];

        $url = $game->game['game_path'].'?'.http_build_query($queryParams);

        if ($this->company->is_production) {
            $url = Str::replaceFirst('/launcher', '/production', $url);
        }

        return $url;
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
