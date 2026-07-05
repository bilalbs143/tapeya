<?php

namespace App\Support\Broadcast;

/**
 * Deterministic context hash shared with the graphics app ({@see hashGraphicContext} in JS).
 */
final class GraphicContextHash
{
    /**
     * @param  array<string, mixed>|null  $context
     */
    public static function hash(?array $context): string
    {
        $serialized = json_encode($context ?? [], JSON_THROW_ON_ERROR);
        $hash = 5381;
        $length = strlen($serialized);

        for ($i = 0; $i < $length; $i++) {
            $hash = (($hash * 33) ^ ord($serialized[$i])) & 0xFFFFFFFF;
        }

        return dechex($hash);
    }
}
