<?php

namespace App\Utils\Services\Companies\Request;

use App\Enums\Company\CompanyEnum;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Exception;

class CompanyRequestService
{
    public function set(string $key, mixed $data)
    {
        $this->{$key} = $data;
    }

    public function get(string $key): mixed
    {
        return $this->{$key};
    }

    public function has(string $key): bool
    {
        return isset($this->{$key});
    }

    public function hasNot(string $key): bool
    {
        return ! $this->has($key);
    }

    public function remove(string $key): void
    {
        unset($this->{$key});
    }

    public function all(): array
    {
        return get_object_vars($this);
    }

    public function getAll(): object
    {
        return (object) $this->all();
    }

    public function flush(): void
    {
        foreach ($this->all() as $key => $value) {
            $this->remove($key);
        }
    }

    public function __call($name, $arguments)
    {
        if (strpos($name, 'get') === 0) {
            return $this->get(lcfirst(substr($name, 3)));
        }

        if (strpos($name, 'set') === 0) {
            return $this->set(lcfirst(substr($name, 3)), $arguments[0]);
        }

        if (strpos($name, 'hasNot') === 0) {
            return $this->hasNot(lcfirst(substr($name, 6)));
        }

        if (strpos($name, 'has') === 0) {
            return $this->has(lcfirst(substr($name, 3)));
        }

        if (strpos($name, 'remove') === 0) {
            return $this->remove(lcfirst(substr($name, 6)));
        }

        if (strpos($name, 'all') === 0) {
            return $this->all();
        }

        if (strpos($name, 'flush') === 0) {
            return $this->flush();
        }
    }

    // Helpers

    public function getCompanyId()
    {
        return $this->getCompany()->id;
    }

    public function getSessionId()
    {
        return $this->getSession()->id;
    }

    public function getSessionToken()
    {
        return $this->getSession()->token;
    }

    public function startSession()
    {
        $this->get('session')->start();
        $this->get('session')->refresh();
    }

    public function hasNoFunds()
    {
        if ($this->hasNotUser()) {
            return false;
        }

        $user = $this->getUser();

        return $user->holding_money <= 0;
    }

    public function isUserActive()
    {
        if ($this->hasNotUser()) {
            return false;
        }

        $user = $this->getUser();

        return $user->isActive();
    }

    public function holdingMoney()
    {
        if ($this->hasNotUser()) {
            return 0;
        }

        $user = $this->getUser();

        $user->refresh();

        return $user->holding_money;
    }

    public function throwResponse(Exception $e)
    {
        if ($this->getCompany()->key === CompanyEnum::ANTECHIP) {
            return response()->json([
                'status' => AntechipSeamlessService::getStatus($e->getMessage(), validation_failure: true),
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
}
