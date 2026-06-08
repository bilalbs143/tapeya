<?php

namespace App\Services;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\NoBallRunsTypeEnum;
use App\Enums\Event\NoBallTypeEnum;
use App\Enums\Event\OverthrowDeliveryTypeEnum;
use App\Enums\Event\PenaltyReasonEnum;
use App\Enums\Event\PenaltyTeamEnum;
use Illuminate\Validation\ValidationException;

/**
 * Normalizes and validates delivery flags before persisting a ball.
 */
class BallDeliveryNormalizer
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function normalize(array $data): array
    {
        if (! empty($data['overthrow_delivery_type'])) {
            // S4: normalizeOverthrow() now returns raw $data without calling
            // finalizePenaltyAward internally — the outer call below handles it once.
            return self::finalizePenaltyAward(self::normalizeOverthrow($data));
        }

        if (($data['dismissal_type'] ?? null) === DismissalTypeEnum::RUN_OUT->value) {
            return self::finalizePenaltyAward(self::normalizeRunOut($data));
        }

        if (self::usesDismissalDeliveryContext($data)) {
            return self::finalizePenaltyAward(self::normalizeDismissalDeliveryContext($data));
        }

        $combinedNoBallWicket = ($data['is_wicket'] ?? false)
            && ($data['is_no_ball'] ?? false)
            && ! ($data['is_free_hit'] ?? false);

        // Combined no-ball + wicket (Law 21.18): no NB type chips — server adds the NB penalty.
        if ($combinedNoBallWicket) {
            unset($data['no_ball_type'], $data['no_ball_runs_type']);

            return self::finalizePenaltyAward($data);
        }

        $isNoBall = (bool) ($data['is_no_ball'] ?? false);

        if (! $isNoBall) {
            unset($data['no_ball_type'], $data['no_ball_runs_type']);

            return self::finalizePenaltyAward($data);
        }

        $type = $data['no_ball_type'] ?? null;
        $runsType = $data['no_ball_runs_type'] ?? null;

        if ($type === null || $runsType === null) {
            throw ValidationException::withMessages([
                'no_ball_type' => ['No ball type is required.'],
                'no_ball_runs_type' => ['No ball runs type is required.'],
            ]);
        }

        NoBallTypeEnum::from($type);
        $runsTypeEnum = NoBallRunsTypeEnum::from($runsType);

        // S6: shared helper — eliminates the three identical switch blocks.
        $data = self::applyRunsType($data, $runsTypeEnum);

        return self::finalizePenaltyAward($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function usesDismissalDeliveryContext(array $data): bool
    {
        return in_array($data['dismissal_type'] ?? null, [
            DismissalTypeEnum::OBSTRUCTING_THE_FIELD->value,
            DismissalTypeEnum::RETIRED->value,
            DismissalTypeEnum::RETIRED_HURT->value,
        ], true);
    }

    /**
     * Obstruct / retired dismissals — delivery type chips and "don't count the ball".
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function normalizeDismissalDeliveryContext(array $data): array
    {
        $combinedWide = ($data['is_wicket'] ?? false) && ($data['is_wide'] ?? false);
        $combinedNoBall = ($data['is_wicket'] ?? false)
            && ($data['is_no_ball'] ?? false)
            && ! ($data['is_free_hit'] ?? false);

        if ($combinedWide) {
            $data['dismissal_delivery_type'] = OverthrowDeliveryTypeEnum::WIDE->value;
        } elseif ($combinedNoBall) {
            $data['dismissal_delivery_type'] = OverthrowDeliveryTypeEnum::NO_BALL->value;
        } else {
            $delivery = OverthrowDeliveryTypeEnum::from($data['dismissal_delivery_type'] ?? OverthrowDeliveryTypeEnum::FAIR->value);
            if (! $delivery->validForDismissalDeliveryContext()) {
                throw ValidationException::withMessages([
                    'dismissal_delivery_type' => ['Invalid delivery type for this dismissal.'],
                ]);
            }
            $data['dismissal_delivery_type'] = $delivery->value;
            $data['is_bye'] = false;
            $data['is_leg_bye'] = false;

            switch ($delivery) {
                case OverthrowDeliveryTypeEnum::FAIR:
                    $data['is_wide'] = false;
                    $data['is_no_ball'] = false;
                    unset($data['no_ball_type'], $data['no_ball_runs_type']);
                    break;
                case OverthrowDeliveryTypeEnum::WIDE:
                    $data['is_wide'] = true;
                    $data['is_no_ball'] = false;
                    unset($data['no_ball_type'], $data['no_ball_runs_type']);
                    break;
                case OverthrowDeliveryTypeEnum::NO_BALL:
                    $data['is_wide'] = false;
                    $data['is_no_ball'] = true;
                    $data['no_ball_type'] = $data['no_ball_type'] ?? NoBallTypeEnum::OVER_FOOTED->value;
                    $data['no_ball_runs_type'] = $data['no_ball_runs_type'] ?? NoBallRunsTypeEnum::FROM_BAT->value;
                    break;
            }
        }

        return $data;
    }

    /**
     * Validate and default metadata for penalty-only awards (Law 41.17).
     * Also applies shared delivery defaults (e.g. dont_count_ball) before persist.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function finalizePenaltyAward(array $data): array
    {
        if (self::isPenaltyOnlyPayload($data)) {
            $reason = $data['penalty_reason'] ?? null;
            if ($reason === null || $reason === '') {
                throw ValidationException::withMessages([
                    'penalty_reason' => ['Penalty reason is required.'],
                ]);
            }

            PenaltyReasonEnum::from($reason);

            $team = $data['penalty_team'] ?? PenaltyTeamEnum::BATTING->value;
            PenaltyTeamEnum::from($team);
            $data['penalty_team'] = $team;
            $data['penalty_reason'] = $reason;
        }

        return self::finalizeDeliveryDefaults($data);
    }

    /**
     * DB-backed booleans that must not remain null after normalization.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function finalizeDeliveryDefaults(array $data): array
    {
        if (($data['dont_count_ball'] ?? null) === null) {
            // Retired / obstruct dismissals may exclude the delivery from the over.
            $data['dont_count_ball'] = self::usesDismissalDeliveryContext($data);
        } else {
            $data['dont_count_ball'] = (bool) $data['dont_count_ball'];
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function isPenaltyOnlyPayload(array $data): bool
    {
        if ((int) ($data['penalty_runs'] ?? 0) === 0) {
            return false;
        }

        if ((bool) ($data['is_wicket'] ?? false)) {
            return false;
        }

        if ((bool) ($data['is_wide'] ?? false)
            || (bool) ($data['is_no_ball'] ?? false)
            || (bool) ($data['is_bye'] ?? false)
            || (bool) ($data['is_leg_bye'] ?? false)) {
            return false;
        }

        return (int) ($data['runs_off_bat'] ?? 0) === 0
            && (int) ($data['extra_runs'] ?? 0) === 0;
    }

    /**
     * S6: Shared run-type normalization — maps NoBallRunsTypeEnum onto the run columns.
     * Extracted from the three previously-identical switch blocks in normalize(),
     * normalizeRunOut(), and normalizeOverthrow().
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function applyRunsType(array $data, NoBallRunsTypeEnum $runsType): array
    {
        $runsOffBat = (int) ($data['runs_off_bat'] ?? 0);
        $extraRuns = (int) ($data['extra_runs'] ?? 0);

        $data['is_bye'] = false;
        $data['is_leg_bye'] = false;

        switch ($runsType) {
            case NoBallRunsTypeEnum::FROM_BAT:
                $data['runs_off_bat'] = $runsOffBat;
                $data['extra_runs'] = 0;
                break;
            case NoBallRunsTypeEnum::BYE:
                $data['runs_off_bat'] = 0;
                $data['extra_runs'] = $extraRuns;
                $data['is_bye'] = true;
                break;
            case NoBallRunsTypeEnum::LEG_BYE:
                $data['runs_off_bat'] = 0;
                $data['extra_runs'] = $extraRuns;
                $data['is_leg_bye'] = true;
                break;
        }

        return $data;
    }

    /**
     * Map run-out extras (0–6 before dismissal) onto delivery run columns.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function normalizeRunOut(array $data): array
    {
        $extra = (int) ($data['runout_extra_runs'] ?? 0);
        $runType = $data['runout_run_type'] ?? null;

        if ($extra > 0 && $runType !== null && $runTapp / docs / scoring - refactor - plan.md.ype !== '') {
            $runsTypeEnum = NoBallRunsTypeEnum::from($runType);
            // S6: use shared helper instead of a duplicated inline switch.
            $data = self::applyRunsType(
                array_merge($data, ['runs_off_bat' => $extra, 'extra_runs' => $extra]),
                $runsTypeEnum,
            );
        }

        // S5: batter_crossed IS meaningful on no-ball run-outs — it determines which
        // end the incoming batter faces. The previous code removed it unconditionally,
        // silently breaking creaseAfterDismissalBall() for no-ball run-out scenarios.

        return $data;
    }

    /**
     * Map overthrow UI payload (delivery type + extra runs) to ball columns.
     * S4: Returns raw $data — finalizePenaltyAward() is called by the outer normalize().
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function normalizeOverthrow(array $data): array
    {
        $delivery = OverthrowDeliveryTypeEnum::from($data['overthrow_delivery_type']);
        $runs = (int) ($data['extra_runs'] ?? 0);

        switch ($delivery) {
            case OverthrowDeliveryTypeEnum::FAIR:
                $data['is_wide'] = false;
                $data['is_no_ball'] = false;
                unset($data['no_ball_type'], $data['no_ball_runs_type']);
                // S6: on overthrow FROM_BAT, runs go to runs_off_bat.
                $data = self::applyRunsType(
                    array_merge($data, ['runs_off_bat' => $runs, 'extra_runs' => 0]),
                    NoBallRunsTypeEnum::FROM_BAT,
                );
                break;
            case OverthrowDeliveryTypeEnum::WIDE:
                $data['is_wide'] = true;
                $data['is_no_ball'] = false;
                unset($data['no_ball_type'], $data['no_ball_runs_type']);
                $data['runs_off_bat'] = 0;
                $data['extra_runs'] = $runs;
                $data['is_bye'] = false;
                $data['is_leg_bye'] = false;
                break;
            case OverthrowDeliveryTypeEnum::NO_BALL:
                $data['is_wide'] = false;
                $data['is_no_ball'] = true;
                $data['no_ball_type'] = $data['no_ball_type'] ?? NoBallTypeEnum::OVER_FOOTED->value;
                $data['no_ball_runs_type'] = $data['no_ball_runs_type'] ?? NoBallRunsTypeEnum::FROM_BAT->value;
                $data['runs_off_bat'] = $runs;
                $data['extra_runs'] = 0;
                $data['is_bye'] = false;
                $data['is_leg_bye'] = false;
                break;
            case OverthrowDeliveryTypeEnum::BYE:
                $data['is_wide'] = false;
                $data['is_no_ball'] = false;
                unset($data['no_ball_type'], $data['no_ball_runs_type']);
                $data['runs_off_bat'] = 0;
                $data['extra_runs'] = $runs;
                $data['is_bye'] = true;
                $data['is_leg_bye'] = false;
                break;
            case OverthrowDeliveryTypeEnum::LEG_BYE:
                $data['is_wide'] = false;
                $data['is_no_ball'] = false;
                unset($data['no_ball_type'], $data['no_ball_runs_type']);
                $data['runs_off_bat'] = 0;
                $data['extra_runs'] = $runs;
                $data['is_bye'] = false;
                $data['is_leg_bye'] = true;
                break;
        }

        // S4: do NOT call finalizePenaltyAward() here — normalize() calls it once on
        // the return value of this method.
        return $data;
    }
}
