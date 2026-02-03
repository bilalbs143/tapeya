<?php

namespace App\Http\Requests\Seamless\Vinus;

use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Utils\Services\Utils;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class VinusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    private function __authenticateRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 11
            'data' => ['required'],
            'data.token' => ['required'],
        ];
    }

    private function __balanceRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 11, 22
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.token' => ['required'],
            'data.user_id' => ['required'],
        ];
    }

    private function __betRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41,31
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.game_type' => ['sometimes'],
            'data.game_sort' => ['sometimes'],
            'data.vendor' => ['sometimes'],
            'data.game' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    private function __betWinRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41,31
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.vendor' => ['sometimes'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.game_type' => ['sometimes'],
            'data.game_sort' => ['sometimes'],
            'data.game' => ['required'],
            'data.amount' => ['sometimes'],
            'data.bet' => ['required'],
            'data.win' => ['required'],
        ];
    }

    private function __winRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.game' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    private function __winAddRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.game' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    private function __bonusRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    private function __bonusWinRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    public function __promoWinRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    public function __jackpotWinRules(): array
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,41
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
            'data.game_id' => ['required'],
            'data.round_id' => ['required'],
            'data.amount' => ['required'],
        ];
    }

    public function __cancelRules()
    {
        return [
            'command' => ['required'],
            'check' => ['required'], // 21,22,42
            'timestamp' => ['required'],
            'data' => ['required'],
            'data.user_id' => ['required'],
            'data.transaction_id' => ['required'],
        ];
    }

    public function rules(): array
    {
        $command = Str::camel($this->command);
        $method = "__{$command}Rules";

        if (! method_exists($this, $method)) {
            throw new FailureException('Invalid Request Method', customCode: VinusStatusCode::VALIDATION_ERRORS);
        }

        return $this->$method();
    }

    public function getData(string $key, $default = null)
    {
        $value = Utils::arrayValue($this->data, $key, $default);

        if ($value && ($key === 'amount' || $key === 'bet' || $key === 'win')) {
            $value = intval($value);
        }

        return $value;
    }

    public function getTransactionId()
    {
        return $this->getData('transaction_id');
    }

    public function getAmount()
    {
        return $this->getData('amount');
    }

    public function getGameId()
    {
        return $this->getData('game_id');
    }

    public function _getGameId()
    {
        return $this->getData('game');
    }

    public function getRoundId()
    {
        return $this->getData('round_id');
    }
}
