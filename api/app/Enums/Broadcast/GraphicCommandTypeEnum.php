<?php

namespace App\Enums\Broadcast;

/**
 * High-level graphics groups for the match controller (case order = default section order in UI).
 */
enum GraphicCommandTypeEnum: string
{
    case LOWER_THIRD = 'LOWER_THIRD';
    case FULL_SCREEN = 'FULL_SCREEN';
    case TOUR_HITS = 'TOUR_HITS';
    case FULL_SCREEN_TRANSITION = 'FULL_SCREEN_TRANSITION';
    case BREAK = 'BREAK';
    case TOURNAMENT = 'TOURNAMENT';
    case CHART = 'CHART';
    case BATSMAN_STATS = 'BATSMAN_STATS';
    case BOWLER_STATS = 'BOWLER_STATS';
    case CAPTION = 'CAPTION';

    /** Section heading in the backoffice match graphics controller. */
    public function controllerGroupTitle(): string
    {
        return match ($this) {
            self::LOWER_THIRD => 'Lower Third',
            self::FULL_SCREEN => 'Full Screen',
            self::TOUR_HITS => 'Tour Hits',
            self::FULL_SCREEN_TRANSITION => 'Full Screen Transitions',
            self::BREAK => 'Breaks',
            self::TOURNAMENT => 'Tournament',
            self::CHART => 'Charts',
            self::BATSMAN_STATS => 'Batsman',
            self::BOWLER_STATS => 'Bowler',
            self::CAPTION => 'Caption',
        };
    }
}
