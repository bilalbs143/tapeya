<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

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
            $status = match ($type) {
                'UNAUTHORIZED' => 401,
                'FORBIDDEN' => 403,
                'NOT_FOUND' => 404,
                'CONFLICT' => 409,
                'VALIDATION_ERROR' => 422,
                'SERVER_ERROR' => 500,
                default => 400,
            };
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

        Response::macro('forbidden', function (?string $message = null) {
            return response()->json(['message' => $message ?? 'Forbidden'], 403);
        });

        Response::macro('noContent', function () {
            return response()->noContent();
        });
    }
}
