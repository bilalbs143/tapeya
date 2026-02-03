<?php

namespace App\Http\Middleware\Seamless;

use App\Enums\Company\CompanyEnum;
use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Middleware\Seamless\Base\SeamlessMiddlewareTrait;
use App\Utils\Services\Utils;
use Closure;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VinusAuthMiddleware
{
    use SeamlessMiddlewareTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->loadCompany(CompanyEnum::VINUS);

        if ($request->headers->get('authkey') !== CompanyRequest::getCompany()->getConfig('secret')) {
            $this->throw();
        }

        if ($request->data) {
            $token = Utils::arrayValue($request->data, 'token');
            $token = str_replace(CompanyRequest::getCompany()->getConfig('apiKey'), '', $token);
            $gameSessionId = Utils::arrayValue($request->data, 'user_id');

            try {
                if ($token) {
                    $this->loadSession(CompanyRequest::getCompany(), token: $token);
                } elseif ($gameSessionId) {
                    $this->loadSession(CompanyRequest::getCompany(), gameSessionId: $gameSessionId);
                }

                if (CompanyRequest::hasNotSession()) {
                    $this->throw();
                }
            } catch (ModelNotFoundException $e) {
                $this->throw();
            }
        }

        return $next($request);
    }

    private function throw()
    {
        throw new FailureException(msg: __('vinus.invalid_auth_token'), customCode: VinusStatusCode::VALIDATION_ERRORS);
    }
}
