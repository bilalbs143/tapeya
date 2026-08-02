<?php

/**
 * Graphic follow-ups: on event X, activate command Y (optionally delayed).
 *
 * Rules are theme-agnostic. Call GraphicFollowUpScheduler::dispatch() (or
 * onCommandActivated) with event names from GraphicFollowUpEvent.
 *
 * @return list<array{
 *   id: string,
 *   on: string,
 *   when?: array{command_type?: string, command_key?: string},
 *   then: array{
 *     activate: string,
 *     delay_ms?: int,
 *     only_if_still_active?: bool,
 *     copy_payload_keys?: list<string>,
 *   },
 * }>
 */
return [
    [
        'id' => 'fst_restore_default_lt',
        'on' => 'graphic.command_activated',
        'when' => [
            'command_type' => 'FULL_SCREEN_TRANSITION',
        ],
        'then' => [
            // FST is flash-only; restore the default scorebar after the slam cycle.
            'activate' => 'LT_DEFAULT',
            'delay_ms' => 2800,
            'only_if_still_active' => true,
            'copy_payload_keys' => ['innings_number'],
        ],
    ],
];
