<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Broadcast\GraphicCommandTypeEnum;
use App\Jobs\ActivateGraphicCommandFollowUpJob;
use App\Models\MatchGraphicCommand;
use App\Models\TournamentMatch;
use App\Support\Broadcast\GraphicFollowUpEvent;

/**
 * Generic graphic automations: on event X, activate command Y (optionally delayed).
 *
 * Rules live in config/graphics_follow_ups.php. Callers fire named events via
 * {@see self::dispatch()} or the convenience {@see self::onCommandActivated()}.
 */
final class GraphicFollowUpScheduler
{
    /**
     * Fire a follow-up event and schedule any matching rules.
     *
     * @param  array{
     *   command?: MatchGraphicCommand|null,
     *   payload?: array<string, mixed>|null,
     * }  $context
     */
    public function dispatch(
        string $event,
        TournamentMatch $match,
        array $context = [],
        ?int $updatedByUserId = null,
    ): void {
        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            return;
        }

        $command = $context['command'] ?? null;

        foreach ($this->rulesFor($event) as $rule) {
            if (! $this->matchesWhen($rule['when'] ?? [], $command)) {
                continue;
            }

            $this->scheduleRule($rule, $match, $command, $context, $updatedByUserId);
        }
    }

    /**
     * Convenience for Layer-1 takes — used by GraphicCommandController.
     */
    public function onCommandActivated(
        TournamentMatch $match,
        MatchGraphicCommand $command,
        ?int $updatedByUserId = null,
    ): void {
        $this->dispatch(
            GraphicFollowUpEvent::COMMAND_ACTIVATED,
            $match,
            ['command' => $command],
            $updatedByUserId,
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    public function ruleById(string $id): ?array
    {
        foreach (config('graphics_follow_ups', []) as $rule) {
            if (is_array($rule) && ($rule['id'] ?? null) === $id) {
                return $rule;
            }
        }

        return null;
    }

    /**
     * Execute a scheduled follow-up (used by the queue job).
     *
     * @param  array<string, mixed>|null  $payload
     */
    public function activateFollowUp(
        TournamentMatch $match,
        string $targetCommandKey,
        ?int $expectedActiveCommandId,
        bool $onlyIfStillActive,
        ?array $payload,
        ?int $updatedByUserId = null,
    ): bool {
        $session = FindMatchGraphicSession::forMatch($match);
        if (! $session) {
            return false;
        }

        if ($onlyIfStillActive) {
            if ($expectedActiveCommandId === null) {
                return false;
            }
            if ((int) $session->active_command_id !== $expectedActiveCommandId) {
                return false;
            }
        }

        $key = GraphicCommandKeyEnum::tryFrom($targetCommandKey);
        if (! $key) {
            return false;
        }

        $command = MatchGraphicCommand::query()->create([
            'match_graphic_session_id' => $session->id,
            'command_type' => $key->commandType()->value,
            'command_key' => $key->value,
            'payload' => $payload,
            'display_mode' => $key->displayMode()->value,
            'created_by' => $updatedByUserId,
        ]);

        $session->update([
            'active_command_id' => $command->id,
            'updated_by' => $updatedByUserId,
        ]);

        return true;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function rulesFor(string $event): array
    {
        $rules = config('graphics_follow_ups', []);
        if (! is_array($rules)) {
            return [];
        }

        return array_values(array_filter(
            $rules,
            static fn ($rule) => is_array($rule) && ($rule['on'] ?? null) === $event,
        ));
    }

    /**
     * @param  array<string, mixed>  $when
     */
    private function matchesWhen(array $when, ?MatchGraphicCommand $command): bool
    {
        if ($command === null) {
            // Match-domain events (toss / innings / result) may have no command.
            return ! isset($when['command_type']) && ! isset($when['command_key']);
        }

        if (isset($when['command_type']) && ! $this->commandTypeMatches($command, (string) $when['command_type'])) {
            return false;
        }

        if (isset($when['command_key']) && (string) $command->command_key !== $when['command_key']) {
            return false;
        }

        return true;
    }

    private function commandTypeMatches(MatchGraphicCommand $command, string $expected): bool
    {
        $type = $command->command_type;
        if ($type instanceof GraphicCommandTypeEnum) {
            return $type->value === $expected;
        }

        if ((string) $type === $expected) {
            return true;
        }

        $key = GraphicCommandKeyEnum::tryFrom((string) $command->command_key);

        return $key?->commandType()->value === $expected;
    }

    /**
     * @param  array<string, mixed>  $rule
     * @param  array<string, mixed>  $context
     */
    private function scheduleRule(
        array $rule,
        TournamentMatch $match,
        ?MatchGraphicCommand $command,
        array $context,
        ?int $updatedByUserId,
    ): void {
        $then = $rule['then'] ?? [];
        $activateKey = $then['activate'] ?? null;
        if (! is_string($activateKey) || $activateKey === '') {
            return;
        }

        $ruleId = $rule['id'] ?? null;
        if (! is_string($ruleId) || $ruleId === '') {
            return;
        }

        $delayMs = max(0, (int) ($then['delay_ms'] ?? 0));
        $onlyIfStillActive = (bool) ($then['only_if_still_active'] ?? false);
        $expectedActiveId = $onlyIfStillActive && $command ? $command->id : null;

        $pending = ActivateGraphicCommandFollowUpJob::dispatch(
            $match->id,
            $ruleId,
            $expectedActiveId,
            $this->buildPayload($then, $command, $context),
            $updatedByUserId,
        );

        if ($delayMs > 0) {
            $pending->delay(now()->addMilliseconds($delayMs));
        }
    }

    /**
     * @param  array<string, mixed>  $then
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>|null
     */
    private function buildPayload(array $then, ?MatchGraphicCommand $command, array $context): ?array
    {
        if (array_key_exists('payload', $context) && is_array($context['payload'])) {
            return $context['payload'];
        }

        $keys = $then['copy_payload_keys'] ?? [];
        if (! is_array($keys) || $keys === [] || ! $command) {
            return null;
        }

        $source = is_array($command->payload) ? $command->payload : [];
        $payload = [];
        foreach ($keys as $key) {
            if (! is_string($key) || ! array_key_exists($key, $source)) {
                continue;
            }
            $payload[$key] = $source[$key];
        }

        return $payload === [] ? null : $payload;
    }
}
