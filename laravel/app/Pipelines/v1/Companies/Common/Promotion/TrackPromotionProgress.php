<?php

namespace App\Pipelines\v1\Companies\Common\Promotion;

use App\Models\Game;
use App\Models\Transaction;
use App\Promotions\Dto\BetEvent;
use App\Promotions\Services\PromotionTrackerService;
use Closure;
use Illuminate\Support\Collection;

class TrackPromotionProgress
{
    public function __construct(
        private readonly PromotionTrackerService $trackerService
    ) {}

    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $transaction = $collection->get('transaction');
        $game = $collection->get('game');
        $debitTransaction = $collection->get('reference_debit_transaction');
        $creditTransaction = $collection->get('reference_credit_transaction');

        // Track for both DEBIT (bet placement) and settled bets (WIN, REFUND, CANCEL)
        // DEBIT tracking ensures all bets count toward turnover requirements
        // WIN/REFUND/CANCEL tracking provides settlement data for promotions that need it
        if ($this->shouldTrack($transaction, $debitTransaction)) {
            $product = $this->determineProduct($game);

            if ($product) {
                $betEvent = $this->createBetEvent(
                    transaction: $transaction,
                    debitTransaction: $debitTransaction,
                    creditTransaction: $creditTransaction,
                    product: $product
                );

                // Track promotion progress
                // Note: This runs synchronously. If performance becomes an issue,
                // consider dispatching to a queue: dispatch(fn() => $this->trackerService->handle($betEvent))->afterResponse();
                try {
                    $this->trackerService->handle($betEvent);
                } catch (\Exception $e) {
                    // Log error but don't fail the transaction
                    \Log::error('Promotion tracking failed', [
                        'error' => $e->getMessage(),
                        'bet_event' => $betEvent,
                    ]);
                }
            }
        }

        return $next($collection);
    }

    /**
     * Determine if we should track this transaction for promotions.
     */
    private function shouldTrack(?Transaction $transaction, ?Transaction $debitTransaction): bool
    {
        // For turnover-based promotions (like Slots Deposit Bonus), we need to track on DEBIT
        // because turnover = total amount wagered, regardless of win/loss outcome.
        // For other promotions that need settlement info, track on WIN/REFUND/CANCEL.

        // Track on DEBIT (bet placement) - ensures all bets count toward turnover
        if ($transaction && $transaction->isBet()) {
            return true;
        }

        // Also track on WIN, REFUND, or CANCEL for promotions that need settlement data
        if ($transaction && $debitTransaction) {
            return $transaction->isWin()
                || $transaction->isRefund()
                || $transaction->isCancel();
        }

        return false;
    }

    /**
     * Determine product type from game.
     */
    private function determineProduct(?Game $game): ?string
    {
        if (! $game) {
            return null;
        }

        // Map game flags to product types
        if ($game->is_slot_game) {
            return 'slots';
        }

        if ($game->is_baccarat_casino || $game->is_blackjack_casino || $game->is_roulette_casino) {
            return 'baccarat'; // or 'casino' depending on your naming
        }

        if ($game->is_sport) {
            return 'sportsbook';
        }

        if ($game->is_poker) {
            return 'poker';
        }

        // Add more mappings as needed
        // For arcade, sabung, etc.

        return null;
    }

    /**
     * Create BetEvent from transactions.
     */
    private function createBetEvent(
        Transaction $transaction,
        ?Transaction $debitTransaction,
        ?Transaction $creditTransaction,
        string $product
    ): BetEvent {
        // Handle DEBIT (bet placement) - for turnover tracking
        if ($transaction->isBet()) {
            $stake = (float) $transaction->money;
            $payout = 0.0; // Not settled yet
            $result = null; // Bet not settled yet

            return new BetEvent(
                userId: $transaction->user_id,
                product: $product,
                stake: $stake,
                payout: $payout,
                odds: null,
                ticketId: $transaction->txn_id,
                result: $result,
                meta: [
                    'transaction_id' => $transaction->id,
                    'debit_transaction_id' => $transaction->id,
                    'credit_transaction_id' => null,
                    'game_id' => $transaction->game_id,
                ]
            );
        }

        // Handle WIN, REFUND, CANCEL (settled bets)
        $stake = $debitTransaction ? (float) $debitTransaction->money : 0.0;
        $payout = $creditTransaction ? (float) $creditTransaction->money : 0.0;

        // Determine result
        $result = null;
        if ($transaction->isWin()) {
            $result = $payout > $stake ? 'win' : ($payout < $stake ? 'lose' : 'tie');
        } elseif ($transaction->isRefund()) {
            $result = 'refund';
        } elseif ($transaction->isCancel()) {
            $result = 'cancel';
        }

        return new BetEvent(
            userId: $transaction->user_id,
            product: $product,
            stake: $stake,
            payout: $payout,
            odds: null, // Add if available from transaction meta
            ticketId: $debitTransaction?->txn_id,
            result: $result,
            meta: [
                'transaction_id' => $transaction->id,
                'debit_transaction_id' => $debitTransaction?->id,
                'credit_transaction_id' => $creditTransaction?->id,
                'game_id' => $transaction->game_id,
            ]
        );
    }
}
