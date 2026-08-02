<?php

namespace App\Support\Media;

use RuntimeException;
use Throwable;

/**
 * Media disk write failed (S3/local). Never persist a falsey path to the DB.
 */
class MediaWriteException extends RuntimeException
{
    public function __construct(string $message = 'Media upload failed.', int $code = 0, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
