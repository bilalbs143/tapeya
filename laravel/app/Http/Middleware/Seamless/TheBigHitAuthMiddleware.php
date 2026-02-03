<?php

namespace App\Http\Middleware\Seamless;

use App\Enums\Company\CompanyEnum;
use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Middleware\Seamless\Base\SeamlessMiddlewareTrait;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
use Closure;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TheBigHitAuthMiddleware
{
    use SeamlessMiddlewareTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->loadCompany(CompanyEnum::THEBIGHIT);

        $requestId = $request->input('requestid');
        $signature = $request->input('signature');
        $token = $request->input('token');

        if (! $token) {
            $this->throw(TheBigHitStatusCode::MISSING_TOKEN_VALUE);
        }

        if (! $requestId) {
            $this->throw(TheBigHitStatusCode::MISSING_REQUEST_ID_VALUE);
        }

        if (! $signature) {
            $this->throw(TheBigHitStatusCode::MISSING_SIGNATURE_VALUE);
        }

        $generatedSignature = TheBigHitSeamlessService::generateSignature($requestId, $token);

        if ($generatedSignature !== $signature) {
            $this->throw(TheBigHitStatusCode::INVALID_REQUEST);
        }

        try {
            if ($token) {
                $this->loadSession(CompanyRequest::getCompany(), token: $token);
            }

            if (CompanyRequest::hasNotSession()) {
                $this->throw(TheBigHitStatusCode::INVALID_TOKEN);
            }
        } catch (ModelNotFoundException $e) {
            $this->throw(TheBigHitStatusCode::INVALID_TOKEN);
        }

        return $next($request);
    }

    private function throw(TheBigHitStatusCode $customCode)
    {
        throw new FailureException(msg: $customCode->message(), customCode: $customCode);
    }
}
