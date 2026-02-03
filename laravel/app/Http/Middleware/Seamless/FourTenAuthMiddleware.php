<?php

namespace App\Http\Middleware\Seamless;

use App\Enums\Company\CompanyEnum;
use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Middleware\Seamless\Base\SeamlessMiddlewareTrait;
use Closure;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FourTenAuthMiddleware
{
    use SeamlessMiddlewareTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->loadCompany(CompanyEnum::FOURTEN);

        // FourTen sends API Key via Authorization header
        $authorizationHeader = $request->header('Authorization');
        $apiKey = CompanyRequest::getCompany()->getConfig('apiKey');

        // Skip auth check in local environment for testing
        if (env('APP_ENV') !== 'local') {
            if (! $authorizationHeader || $authorizationHeader !== $apiKey) {
                $this->throw(FourTenStatusCode::INVALID_REQUEST);
            }
        }

        // Load session based on user_id parameter
        $userId = $request->input('user_id');

        if ($userId) {
            try {
                $this->loadSession(CompanyRequest::getCompany(), userId: $userId);
            } catch (ModelNotFoundException $e) {
                $this->throw(FourTenStatusCode::INVALID_TOKEN);
            }
        }

        return $next($request);
    }

    private function throw(FourTenStatusCode $customCode)
    {
        throw new FailureException(msg: $customCode->message(), customCode: $customCode);
    }
}
