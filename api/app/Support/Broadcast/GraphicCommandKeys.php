<?php

namespace App\Support\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;

final class GraphicCommandKeys
{
    /**
     * @return array<string, list<string>>
     */
    public static function byType(): array
    {
        $map = [];
        foreach (GraphicCommandKeyEnum::cases() as $case) {
            $t = $case->commandType()->value;
            $map[$t][] = $case->value;
        }

        return $map;
    }

    public static function isAllowed(string $type, string $key): bool
    {
        $k = GraphicCommandKeyEnum::tryFrom($key);

        return $k !== null && $k->commandType()->value === $type;
    }
}
