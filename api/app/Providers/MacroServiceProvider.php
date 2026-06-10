<?php

namespace App\Providers;

use App\Http\ApiErrorCatalog;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class MacroServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->response();
    }

    private function response(): void
    {
        Response::macro('success', function ($data = null, ?string $message = null, string $type = 'SUCCESS') {
            $payload = array_filter(
                [
                    'data' => $data,
                    'message' => $message,
                    'type' => $type,
                ],
                fn ($v) => $v !== null
            );

            $status = $type === 'CREATED' ? 201 : 200;

            return response()->json($payload, $status);
        });

        Response::macro('failure', function (?string $message = null, string $type = 'BAD_REQUEST', $errors = null) {
            $status = ApiErrorCatalog::statusForType($type);

            $payload = array_filter(
                [
                    'message' => $message,
                    'type' => $type,
                    'errors' => $errors,
                ],
                fn ($v) => $v !== null
            );

            return response()->json($payload, $status);
        });

        Response::macro('fromHttpException', function (HttpExceptionInterface $e) {
            return ApiErrorCatalog::jsonFromHttpException($e);
        });

        Response::macro('forbidden', function (?string $message = null) {
            return response()->failure($message ?? 'This action is unauthorized.', 'FORBIDDEN');
        });

        Response::macro('noContent', function () {
            return response()->noContent();
        });
    }
}
