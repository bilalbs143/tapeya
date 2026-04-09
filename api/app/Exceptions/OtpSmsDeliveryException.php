<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class OtpSmsDeliveryException extends Exception
{
    public function __construct(
        string $message = 'Unable to send verification code. Please try again.',
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
