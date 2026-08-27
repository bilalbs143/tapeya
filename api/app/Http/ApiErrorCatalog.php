<?php

namespace App\Http;

use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

final class ApiErrorCatalog
{
    /** @var array<int, array{0: string, 1: string}> */
    private const BY_STATUS = [
        401 => ['UNAUTHORIZED', 'Unauthenticated.'],
        403 => ['FORBIDDEN', 'This action is unauthorized.'],
        404 => ['NOT_FOUND', 'Resource not found.'],
        409 => ['CONFLICT', 'Conflict.'],
        410 => ['GONE', 'Resource is gone.'],
        422 => ['VALIDATION_ERROR', 'Unprocessable request.'],
        429 => ['TOO_MANY_REQUESTS', 'Too many requests.'],
        503 => ['SERVICE_UNAVAILABLE', 'Service unavailable.'],
    ];

    private const TYPE_STATUS = [
        'UNAUTHORIZED' => 401,
        'FORBIDDEN' => 403,
        'VENDOR_PROFILE_REQUIRED' => 403,
        'VENDOR_NOT_APPROVED' => 403,
        'VENDOR_SUSPENDED' => 403,
        'NOT_FOUND' => 404,
        'CONFLICT' => 409,
        'GONE' => 410,
        'VALIDATION_ERROR' => 422,
        'TOO_MANY_REQUESTS' => 429,
        'SERVER_ERROR' => 500,
        'SERVICE_UNAVAILABLE' => 503,
        'BAD_REQUEST' => 400,
    ];

    public static function typeForStatus(int $status): string
    {
        return self::BY_STATUS[$status][0] ?? ($status >= 500 ? 'SERVER_ERROR' : 'BAD_REQUEST');
    }

    public static function defaultMessage(int $status): string
    {
        return self::BY_STATUS[$status][1] ?? ($status >= 500 ? 'Server error.' : 'Bad request.');
    }

    public static function statusForType(string $type): int
    {
        return self::TYPE_STATUS[$type] ?? 400;
    }

    public static function jsonFromHttpException(HttpExceptionInterface $e)
    {
        $status = $e->getStatusCode();
        $type = self::typeForStatus($status);

        // Preserve the exception status — do not remap through statusForType(), which
        // collapses unknown types (and previously 410/503) into 400/500.
        return response()->json(
            array_filter(
                [
                    'message' => $e->getMessage() ?: self::defaultMessage($status),
                    'type' => $type,
                ],
                fn ($v) => $v !== null
            ),
            $status
        );
    }
}
