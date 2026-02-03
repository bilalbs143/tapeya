<?php

namespace App\Http\Middleware\Seamless;

use App\Enums\Company\CompanyEnum;
use App\Facades\CompanyRequest;
use App\Http\Middleware\Seamless\Base\SeamlessMiddlewareTrait;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use App\Utils\Services\Utils;
use Closure;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AntechipAuthMiddleware
{
    use SeamlessMiddlewareTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->loadCompany(CompanyEnum::ANTECHIP);

        if (! $this->verifyHash($request)) {
            return response()->json([
                'status' => AntechipSeamlessService::getStatus('Invalid hash', provider_auth_error: true),
            ]);
        }

        try {
            $this->loadSession(CompanyRequest::getCompany(), token: $request->input('user.token'));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => AntechipSeamlessService::getStatus('User Not Found', auth_error: true),
            ]);
        }

        return $next($request);
    }

    private function verifyHash(Request $request)
    {
        // is local env
        if (env('APP_ENV') === 'local') {
            return true;
        }

        if (str_contains($request->path(), 'report_errors')) {
            return true;
        }

        $secret = md5(CompanyRequest::getCompany()->getConfig('secret'));
        $hash = Utils::getSortedHash($request->data ?: [], $secret);

        return $hash === $request->hash;
    }
}
