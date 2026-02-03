<?php

use App\Facades\CompanyRequest;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\Seamless\AntechipAuthMiddleware;
use App\Http\Middleware\Seamless\Base\SeamlessMiddleware;
use App\Http\Middleware\Seamless\FourTenAuthMiddleware;
use App\Http\Middleware\Seamless\TheBigHitAuthMiddleware;
use App\Http\Middleware\Seamless\VinusAuthMiddleware;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\VerifyBlacklistedIp;
use App\Http\Middleware\VerifyWhitelistedIp;
use App\Utils\Services\Utils;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Sentry\Laravel\Integration;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            // Mobile apps use token-based auth without CSRF protection
            $middleware = ['api', 'locale', 'routestatistics', 'requestlog', 'blacklisted_ip.verify'];

            Route::middleware($middleware)
                ->prefix('api')->group(function () {
                    Route::prefix('v1')->group(function () {
                        Route::prefix('auth')->group(base_path('routes/v1/auth.php'));

                        Route::middleware('auth:api')->group(function () {
                            Route::prefix('admin')->middleware('whitelisted_ip.verify')->group(base_path('routes/v1/admin.php'));
                            Route::prefix('user')->group(base_path('routes/v1/user.php'));
                        });
                        Route::prefix('seamless')->middleware('seamless')->group(base_path('routes/v1/seamless.php'));
                    });
                });
        }
    )
    ->withBroadcasting(
        __DIR__.'/../routes/v1/channels.php',
        ['prefix' => 'api/v1', 'middleware' => [EnsureFrontendRequestsAreStateful::class, 'api', 'auth:api']],
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Set real client IP early, before TrustProxies
        // Handles Cloudflare, AWS ELB, Nginx, and other proxy scenarios
        $middleware->prepend(\App\Http\Middleware\SetRealClientIp::class);
        $middleware->append(ForceJsonResponse::class);

        // Add CORS middleware for API routes
        $middleware->api([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'locale' => SetLocale::class,
            'json.response' => ForceJsonResponse::class,
            'blacklisted_ip.verify' => VerifyBlacklistedIp::class,
            'whitelisted_ip.verify' => VerifyWhitelistedIp::class,
            'seamless' => SeamlessMiddleware::class,
            'seamless.antechip' => AntechipAuthMiddleware::class,
            'seamless.vinus' => VinusAuthMiddleware::class,
            'seamless.thebighit' => TheBigHitAuthMiddleware::class,
            'seamless.fourten' => FourTenAuthMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // TODO: Later uncomment this condition
        // if(Utils::isProduction()) {
        Integration::handles($exceptions);
        // }

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($e instanceof AuthorizationException) {
                return response()->forbidden();
            }

            if ($e instanceof ModelNotFoundException) {
                $modelName = class_basename($e->getModel());

                return response()->notFound(__('messages.record_not_found', ['model' => $modelName]));
            }

            if ($e instanceof NotFoundHttpException) {
                return response()->notFound($e->getMessage());
            }

            if ($e instanceof ValidationException) {
                if (CompanyRequest::hasCompany()) {
                    return CompanyRequest::throwResponse($e);
                }
            }
        });
    })->create();
