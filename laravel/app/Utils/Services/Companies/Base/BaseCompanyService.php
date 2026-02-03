<?php

namespace App\Utils\Services\Companies\Base;

use App\Enums\Company\CompanyEnum;
use App\Enums\GameResultCard\GameResultCardStatusEnum;
use App\Models\Company;
use App\Models\Game;
use App\Models\GameResultCard;
use App\Models\Provider;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserGameSession;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

abstract class BaseCompanyService
{
    abstract protected function getFieldsMappings(): Collection;

    abstract protected function fetchGames(?Provider $provider = null): array;

    abstract protected function fieldsMapper(?Provider $provider = null): array;

    abstract protected function generateLaunchUrl(UserGameSession $session, User $user, Game $game, string $language = 'en'): ?string;

    abstract protected function getRemainingBalance(): ?float;

    protected Company $company;

    protected Collection $providers;

    public function __construct(public CompanyEnum $companyKey)
    {
        $this->company = Company::active()->key($companyKey)->firstOrFail();
        $this->providers = Provider::active()->companyId($this->company->id)->get();
    }

    protected function getConfig(string $key, $default = null): mixed
    {
        return $this->company->getConfig($key, $default);
    }

    protected function sendHttpRequest(string $url, array $body = [], array $headers = [], string $method = 'post', bool $isJson = false)
    {
        $url = $this->getConfig('baseUrl').$url;

        $startTime = microtime(true);
        try {
            // Log::setCompany($this->company);
            // Log::setProvider($this->provider);

            $response = Http::withHeaders($headers)
                ->when($isJson, function ($h) {
                    $h->asJson();
                }, function ($h) {
                    $h->asForm();
                })
                ->retry(5, 1000)
                ->timeout(20)
                ->{$method}($url, $body);

            // $timeTaken = calculateTimeTaken($startTime);
            // Log::logProviderResponseMetrics($timeTaken, $response);

            if ($response->ok()) {
                $response = $response->object();
            } else {
                $response = (object) [];
            }

            return $response;
        } catch (\Exception $e) {
            // $timeTaken = calculateTimeTaken($startTime);
            // Log::logProviderResponseMetrics($timeTaken, $e);
            logger()->error($e);

            return null;
        }
    }

    private function getGameIdField(): string
    {
        return collect($this->getFieldsMappings())->filter(function ($mappedField) {
            if (is_string($mappedField)) {
                return $mappedField === 'game_id';
            }
            if (is_array($mappedField)) {
                return in_array('game_id', $mappedField);
            }

            return false;
        })->map(fn ($item, $index) => $index)->first();
    }

    private function getGameIds(array $games): array
    {
        $gameIdField = $this->getGameIdField();

        return collect($games)->map(fn ($item) => $item->{$gameIdField})->toArray();
    }

    private function getGamesBaseQuery(Provider $provider): Builder
    {
        return Game::companyId($this->company->id)->providerId($provider->id);
    }

    private function modifyGamesStatus(Provider $provider, bool $enabled, array $gameIds = []): int
    {
        return $this->getGamesBaseQuery($provider)
            ->when(count($gameIds) > 0, function ($q) use ($gameIds) {
                $q->gameIds($gameIds);
            })
            ->when($enabled, function ($q) {
                $q->disabled();
            }, function ($q) {
                $q->enabled();
            })
            ->update([
                'disabled_at' => $enabled ? null : now(),
            ]);
    }

    private function mapGame(Provider $provider, object $item): array
    {
        $data = [
            'game' => $item,
            'company_id' => $this->company->id,
            'provider_id' => $provider->id,
            'disabled_at' => null,
        ];

        foreach ($this->getFieldsMappings() as $key => $mappedField) {
            if ($mappedField && ($item->{$key} || is_bool($item->{$key}))) {
                if (is_array($mappedField)) {
                    foreach ($mappedField as $field) {
                        $data[CompanyUtils::cleanField($field)] = CompanyUtils::cleanValue($item->{$key}, $field);
                    }
                } else {
                    $data[CompanyUtils::cleanField($mappedField)] = CompanyUtils::cleanValue($item->{$key}, $mappedField);
                }
            }
        }

        foreach ($this->fieldsMapper($provider) as $key => $mapper) {
            if (is_callable($mapper)) {
                $data[$key] = $mapper($item);
            } else {
                $data[$key] = $mapper;
            }
        }

        return $data;
    }

    private function disableGames(Provider $provider, array $games): int
    {
        $existingGameIds = $this->getGamesBaseQuery($provider)->enabled()->pluck('game_id')->toArray();

        $newGameIds = $this->getGameIds($games);

        $gameIdsToBeDisabled = array_values(array_diff($existingGameIds, $newGameIds));

        if (count($gameIdsToBeDisabled) > 0) {
            return $this->modifyGamesStatus($provider, false, $gameIdsToBeDisabled);
        }

        return true;
    }

    public function syncGames(): void
    {
        foreach ($this->providers as $provider) {
            $gamesList = $this->fetchGames($provider);
            $this->disableGames($provider, $gamesList);
            if (count($gamesList) > 0) {
                $items = collect($gamesList)->map(fn ($item) => $this->mapGame($provider, $item))->toArray();
                CompanyUtils::storeGames($items);
            }
        }
    }

    public function launch(Game $game, string $language = 'en'): ?Collection
    {
        $session = UserGameSession::createSession($game->company, $game->provider, $game, auth()->user());
        $launchUrl = $this->generateLaunchUrl($session, auth()->user(), $game, $language);

        if (! $launchUrl) {
            $session->forceDelete();

            return null;
        }

        $session->update(['launch_url' => $launchUrl]);

        return collect([
            'launch_url' => $launchUrl,
            'session_id' => $session->id,
        ]);
    }

    public function createResultCard(Transaction $transaction)
    {
        $data = [
            'user_id' => $transaction->user_id,
            'game_id' => $transaction->game_id,
            'company_id' => $transaction->company_id,
            'provider_id' => $transaction->provider_id,
            'transaction_id' => $transaction->id,
            'round_id' => $transaction->company_round_id,
            'status' => GameResultCardStatusEnum::PENDING,
            'raw_data' => [],
            'data' => [],
        ];

        if ($card = GameResultCard::where('transaction_id', $transaction->id)->first()) {
            return $card;
        }

        return GameResultCard::create($data);
    }

    public function getMyBalance(): ?float
    {
        $balance = $this->getRemainingBalance();

        return $balance ?: 0;
    }
}
