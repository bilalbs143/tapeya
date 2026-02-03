<?php

namespace App\Http\Middleware\Seamless\Base;

use App\Enums\Company\CompanyEnum;
use App\Facades\CompanyRequest;
use App\Models\Company;
use App\Models\UserGameSession;

trait SeamlessMiddlewareTrait
{
    public function loadCompany(CompanyEnum $companyEnum): Company
    {
        $company = Company::where('key', $companyEnum)->firstOrFail();

        CompanyRequest::setCompany($company);

        return $company;
    }

    public function loadSession(Company $company, ?string $token = null, ?string $userId = null, ?int $gameSessionId = null)
    {
        if ($token) {
            $session = $this->getSessionBaseQuery($company)->where('token', $token)->firstOrFail();
        }

        if ($userId) {
            $session = $this->getSessionBaseQuery($company)->where('user_id', $userId)->firstOrFail();
        }

        if ($gameSessionId) {
            $session = $this->getSessionBaseQuery($company)->where('id', $gameSessionId)->firstOrFail();
        }

        $session->updateLastActivity();

        CompanyRequest::setSession($session);
        CompanyRequest::setUser($session->user);

        return $session;
    }

    private function getSessionBaseQuery(Company $company)
    {
        return UserGameSession::with(['user', 'user.wallet'])->active()->where('company_id', $company->id)->latest('id');
    }
}
