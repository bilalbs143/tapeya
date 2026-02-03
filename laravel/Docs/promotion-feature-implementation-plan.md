Promotion Feature – Implementation Plan

Goal
- Backend-driven promotions using enum + per-type calculators; UI only supplies minimal config per type. English keys/types; translations handled via i18n.

Architecture Overview
- Enum: app/Enums/PromotionType.php (e.g., SLOTS_DEPOSIT, CASINO_STREAK, SLOTS_CASHBACK_COMMISSION, SPORTS_CASHBACK_COMMISSION, POKER_RAKEBACK, ARCADE_CASHBACK, CASINO_COMMISSION, LOSS_GUARANTEE, SABUNG_CASHBACK).
- Contract: app/Promotions/Contracts/PromotionCalculatorInterface.php
  - validateAdminInput(array $data): void
  - activationRequirements(User $user, Promotion $promo): EligibilityResult
  - updateProgress(User $user, Promotion $promo, BetEvent $event): ProgressUpdateResult
  - canRedeem(User $user, Promotion $promo, PromotionProgress $progress): bool
  - computePayout(User $user, Promotion $promo, PromotionProgress $progress): PayoutResult
- Factory: app/Promotions/PromotionCalculatorFactory.php maps enum → calculator class.
- Calculators per type: app/Promotions/Calculators/*.php (all logic/formulas server-side).
- Services (aligns to earlier outline): PromotionService (catalog/read), EligibilityService (stacking/time/user checks), TrackerService (ingest bet/settlement), ProgressService (per-user TO/net/streaks), PayoutService (strategy per type + schedules), ClaimService (activation/redemption), ForfeitService (violations/expiry). Tracker consumes normalized bet/settlement events.
- Notification hooks/events: emit activation, progress, completion, forfeiture, payout; feed observability/metrics.

Data Model (English keys; type-specific config in JSON)
- promotions: id, type, name, status, valid_from, valid_to, is_stackable, game_scope, config (JSON), created_by.
- promotion_rules (optional, if you want first-class rule rows): promo_id, key, value, scope (eligibility/odds/provider/time/staking), active.
- promotion_progress: promo_id, user_id, state (eligible/activated/completed/forfeited/expired), turnover, net_win_loss, meta (JSON, e.g., streak), activated_at, completed_at, forfeited_at, reason.
- promotion_payouts (optional detail beyond claims): promo_id, user_id, amount, currency, payout_type, calculated_at, paid_at, state, breakdown (JSON).
- promotion_claims: id, promo_id, user_id, amount, currency, type (bonus/cashback/commission/rakeback/loss-guarantee), state, created_at.
- audit_logs: user_id, promo_id, action, payload, created_at.
- events table/stream optional if existing.
- Caching: active promotions list, per-user progress snapshot; invalidate on bet events and state changes.

Type Inputs (admin-facing, minimal)
- Slots deposit: min_deposit, max_bonus, bonus_percentage, to_multiplier (22x), expiry_after_activation_hours.
- Casino streak: stake_min, stake_max?, streak_length (8), bonus_percentage, day_window (00:00–23:59).
- Sports cashback/commission: cashback_percentage, commission_percentage, min_payout, odds_thresholds (dec/hk/cn/ind/my/us), payout_day (Mon).
- Slots cashback/commission: cashback_percentage, commission_percentage, min_payout, payout_day (Mon).
- Poker rakeback: rakeback_percentage, min_payout, payout_day (Tue).
- Arcade cashback: cashback_percentage, min_payout, max_payout, payout_day (Mon after 14:00).
- Casino commission: commission_percentage, payout_day (Mon), non_stackable flag.
- Loss guarantee: min_deposit_bank_only, max_guarantee, claim_to_multiplier (2x), withdraw_multiplier (4x), max_withdrawable, allowed_providers (PP/PG), first_deposit_only, contact_before_play flag.
- Sabung cashback: rate, min_payout, payout_day (Tue).

Formulas (backend, per type; UI only supplies inputs)
- Slots deposit: Bonus = min(deposit x bonus_percentage, max_bonus). Required TO = (deposit + bonus) x to_multiplier.
- Casino streak: detect streak_length consecutive win-only or loss-only tickets in day_window; Total Stake = sum(stakes in streak); Bonus = Total Stake x bonus_percentage.
- Slots cashback/commission: Commission = Weekly Turnover x commission_percentage; CashbackBase = max(Weekly Net Loss – Commission, 0); Cashback = CashbackBase x cashback_percentage; Total Bonus = Commission + Cashback.
- Sports cashback/commission: same as slots cashback/commission but only qualifying turnover above odds_thresholds; min_payout applies.
- Poker rakeback: Rakeback = Weekly rake/turnover x rakeback_percentage; min_payout applies.
- Arcade cashback: Cashback = clamp(Weekly Turnover x cashback_percentage, min_payout, max_payout).
- Casino commission: Bonus = Weekly Casino Turnover x commission_percentage.
- Loss guarantee: Guarantee = min(loss, max_guarantee) after reaching deposit x claim_to_multiplier; withdrawal allowed when balance >= (deposit + guarantee) x withdraw_multiplier, capped at max_withdrawable.
- Sabung cashback: Cashback = max(Weekly Turnover x rate, min_payout); no cap.

Job / Schedule
- Weekly Mon: sports, slots, casino payouts; arcade payout after 14:00.
- Tue: poker rakeback; sabung cashback.
- Daily: baccarat streak validation; stale progress expiry; loss-guarantee/slots deposit TO checks.
- Real-time: deposit bonus TO, loss guarantee TO updates; streak collection from bet events.

Anti-Abuse & Eligibility
- IP/device/VPN flags; opposite bets (sports); side bets/ties excluded (baccarat); provider filters (PP/PG); first-deposit checks; stackable flag enforcement; post-streak betting freeze (baccarat); odds floor (sports); withdrawal caps (loss guarantee); identity validity.

Frontend/UX Contracts
- Admin: pick type (enum), fill type-specific config schema from backend; upload creatives; toggle status/validity; monitor progress/claims/payouts/forfeits; manual forfeit; preview formulas.
- User: list/Detail/Activate/Claim APIs stay generic; copy and translations fetched from backend; progress payload includes computed fields (TO required/met, net loss, streak status, claim deadlines).

Events & Observability
- Emit domain events: promotion.activated, promotion.progressed, promotion.completed, promotion.forfeited, promotion.paid.
- Metrics: activation rate, completion rate, payout volume by type, forfeit reasons, abuse flags.

Step-by-Step Delivery
1) Define enum and contract:
   - Add PromotionType enum.
   - Add PromotionCalculatorInterface and factory binding.
2) Data model:
   - Migrate promotions (type + config JSON), promotion_progress, promotion_claims/payouts, audit_logs.
3) Calculator skeletons:
   - Implement per-type calculators with formulas and validation; unit tests per calculator.
4) Tracker pipeline:
   - Normalize BetEvent; wire TrackerService to dispatch updateProgress for active promos; enforce product/odds filters.
5) Activation/Claim services:
   - Enforce eligibility + stacking; generic activate/claim endpoints using factory calculators.
6) Payout jobs:
   - Scheduled jobs (Mon/Tue) per type; real-time redemption where applicable; min/max enforcement.
7) Anti-abuse & forfeit:
   - Integrate IP/VPN/opposite-bet checks; forfeit paths and audit reasons.
8) Admin UI contract:
   - Fetch type schema (English keys), submit config; monitoring views for progress/claims/payouts; manual forfeit.
9) User UI contract:
   - Generic list/detail/progress/claim flows; display computed progress; translations handled via i18n keys from backend labels.
10) QA:
   - Fixtures per promo type; simulate bet streams; verify payouts, caps, odds filters, freeze rules, and stackability.

Notes on i18n
- Keep backend keys/types in English; supply label/description/tnc strings via i18n maps. UI reads English keys and renders localized strings.

