<?php

namespace App\Enums\Broadcast;

/**
 * High-level graphics groups for the match controller (order = default section order in UI).
 */
enum GraphicCommandTypeEnum: string
{
    case LOWER_THIRD = 'LOWER_THIRD';
    case TOURNAMENT = 'TOURNAMENT';
    case CHART = 'CHART';
    case FULL_SCREEN = 'FULL_SCREEN';
    case PLAYER_BATSMAN = 'PLAYER_BATSMAN';
    case PLAYER_BOWLER = 'PLAYER_BOWLER';
    case TOUR_HITS = 'TOUR_HITS';
    case TRANSITION = 'TRANSITION';
    case FULL_SCREEN_TRANSITION = 'FULL_SCREEN_TRANSITION';
    case BREAK = 'BREAK';
    case CAPTION = 'CAPTION';

    /** Section heading in the backoffice match graphics controller. */
    public function controllerGroupTitle(): string
    {
        return match ($this) {
            self::LOWER_THIRD => 'Lower Third',
            self::TOURNAMENT => 'Tournament',
            self::CHART => 'Charts',
            self::FULL_SCREEN => 'Full Screen',
            self::PLAYER_BATSMAN => 'Select Batsman',
            self::PLAYER_BOWLER => 'Select Bowler',
            self::TOUR_HITS => 'Tour Stats',
            self::TRANSITION => 'Transitions',
            self::FULL_SCREEN_TRANSITION => 'Full Screen Transitions',
            self::BREAK => 'Breaks',
            self::CAPTION => 'Custom Messages',
        };
    }
}
