<?php

namespace App\Support\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Broadcast\GraphicCommandTypeEnum;

final class GraphicCommandCatalog
{
    /**
     * Grouped actions for the match controller UI (order follows {@see GraphicCommandTypeEnum} cases).
     *
     * @return array{groups: list<array{id: string, title: string, actions: list<array{
     *     command_type: string,
     *     command_key: string,
     *     label: string,
     *     display_mode: string,
     *     category: string,
     *     status: string,
     *     requires: array<string, mixed>
     * }>}>}
     */
    public static function groupedForController(): array
    {
        $groups = [];

        foreach (GraphicCommandTypeEnum::cases() as $type) {
            $actions = array_values(array_filter(
                GraphicCommandKeyEnum::cases(),
                static fn (GraphicCommandKeyEnum $k) => $k->commandType() === $type
            ));

            if ($actions === []) {
                continue;
            }

            $groups[] = [
                'id' => $type->value,
                'title' => $type->controllerGroupTitle(),
                'actions' => array_map(static function (GraphicCommandKeyEnum $k) {
                    $meta = GraphicCommandManifestBuilder::definitionFor($k);

                    return [
                        'command_type' => $k->commandType()->value,
                        'command_key' => $k->value,
                        'label' => $k->label(),
                        'display_mode' => $k->displayMode()->value,
                        'category' => $meta['category'],
                        'status' => $meta['status'],
                        'requires' => $meta['requires'],
                    ];
                }, $actions),
            ];
        }

        return ['groups' => $groups];
    }
}
