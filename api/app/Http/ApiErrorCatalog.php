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
        422 => ['VALIDATION_ERROR', 'Unprocessable request.'],
        429 => ['TOO_MANY_REQUESTS', 'Too many requests.'],
    ];

    private const TYPE_STATUS = [
        'UNAUTHORIZED' => 401,
        'FORBIDDEN' => 403,
        'NOT_FOUND' => 404,
        'CONFLICT' => 409,
        'VALIDATION_ERROR' => 422,
        'TOO_MANY_REQUESTS' => 429,
        'SERVER_ERROR' => 500,
        'SERVICE_UNAVAILABLE' => 503,
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

        return response()->failure(
            $e->getMessage() ?: self::defaultMessage($status),
            self::typeForStatus($status)
        );
    }
}
