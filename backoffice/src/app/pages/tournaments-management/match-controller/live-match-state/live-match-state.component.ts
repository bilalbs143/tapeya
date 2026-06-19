import { Component, Input } from '@angular/core';

type DeliveryChip = {
  trackKey: string;
  display_token: string;
  chip_type: string;
  is_free_hit: boolean;
};

@Component({
  selector: 'app-live-match-state',
  standalone: true,
  imports: [],
  templateUrl: './live-match-state.component.html',
  styleUrl: './live-match-state.component.scss',
})
export class LiveMatchStateComponent {
  @Input() public context: Record<string, unknown> | null = null;

  private get ctx(): Record<string, unknown> {
    return this.context ?? {};
  }

  private unknownStr(value: unknown, fallback = ''): string {
    if (value == null) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
  }

  private ctxStr(key: string): string {
    return this.unknownStr(this.ctx[key]);
  }

  public get scoreStr(): string {
    return this.ctxStr('score');
  }

  public get scoreRuns(): string {
    return this.scoreStr.split('-')[0] ?? '';
  }

  public get scoreWickets(): string {
    return this.scoreStr.split('-')[1] ?? '';
  }

  public get overs(): string {
    return this.ctxStr('overs');
  }

  public get runRate(): string {
    return this.ctxStr('current_rr');
  }

  /** Structured deliveries from graphic session context (backend SOT). */
  public get overDeliveries(): DeliveryChip[] {
    const structured = this.ctx['current_over_deliveries'];
    if (!Array.isArray(structured)) return [];

    return structured.map((row, index) => {
      const item = row as Record<string, unknown>;
      const overNumber = this.unknownStr(item['over_number']);
      const ballInOver = this.unknownStr(item['ball_in_over']);
      const displayToken = this.unknownStr(item['display_token']);
      const trackKey = overNumber !== '' && ballInOver !== '' ? `${overNumber}-${ballInOver}` : `${displayToken}-${index}`;

      return {
        trackKey,
        display_token: displayToken,
        chip_type: this.unknownStr(item['chip_type'], 'single'),
        is_free_hit: Boolean(item['is_free_hit']),
      };
    });
  }

  public get battingTeam(): string {
    const side = this.ctx['batting_team'] as string;
    const home = ((this.ctx['home_team'] as Record<string, unknown>)?.['short_code'] as string) ?? '';
    const away = ((this.ctx['away_team'] as Record<string, unknown>)?.['short_code'] as string) ?? '';
    return side === 'away' ? away : home;
  }

  public get inningsLabel(): string {
    const raw = this.ctx['innings_number'];
    let n = 0;
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      n = raw;
    } else if (typeof raw === 'string' && raw.trim() !== '') {
      const p = parseInt(raw, 10);
      if (Number.isFinite(p)) n = p;
    }
    if (n === 1) return '1st Innings';
    if (n === 2) return '2nd Innings';
    return '';
  }

  public displayBall(delivery: DeliveryChip): string {
    return delivery.display_token === '0' ? '•' : delivery.display_token;
  }
}
