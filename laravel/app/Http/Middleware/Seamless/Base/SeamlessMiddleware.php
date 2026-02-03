<?php

namespace App\Http\Middleware\Seamless\Base;

use App\Facades\CompanyRequest;
use App\Utils\Services\Utils;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SeamlessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestPayload = [
            'path' => $request->path(),
            'url' => $request->url(),
            'payload' => $request->all(),
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
        ];
        logger()->info('Seamless Request', $requestPayload);

        $startTime = microtime(true);
        CompanyRequest::setStartTime($startTime);

        $request->headers->set('Accept', 'application/json');
        $request->headers->set('from', 'Seamless');

        $response = $next($request);

        $timeTaken = Utils::calculateTimeTaken($startTime);

        $responseData = $response->getContent();

        if ($response instanceof JsonResponse) {
            $responseData = $response->getData(true);
        }

        logger()->info('Seamless Response', [
            'response' => $responseData,
            'time_taken' => $timeTaken,
        ]);

        return $response;
    }
}
