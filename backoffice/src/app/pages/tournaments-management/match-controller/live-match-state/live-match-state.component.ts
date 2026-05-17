import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-live-match-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-match-state.component.html',
  styleUrl: './live-match-state.component.scss',
})
export class LiveMatchStateComponent {
  @Input() public context: Record<string, unknown> | null = null;

  private get ctx(): Record<string, unknown> {
    return this.context ?? {};
  }

  private ctxStr(key: string): string {
    const raw = this.ctx[key];
    if (raw == null) return '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
    return '';
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

  public get overBalls(): string[] {
    return (this.ctx['current_over_balls'] as string[]) ?? [];
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

  public ballChipClass(ball: string): string {
    const isFh = ball.endsWith('*');
    const b = ball.replace(/\*$/, '');
    const base =
      'inline-flex shrink-0 items-center justify-center h-7 min-w-[1.75rem] px-1 rounded-md text-[11px] font-bold leading-none';

    let body = '';
    if (b === 'W') body = 'bg-[#EF4444] text-white';
    else if (b === 'RH') body = 'bg-[#6B7280] text-white';
    else if (b === '0') body = 'border-2 border-[#3B3B35] bg-[#141412] text-white/60';
    else if (b === '4') body = 'bg-[#22C55E] text-white';
    else if (b === '6') body = 'bg-[#A855F7] text-white';
    else if (/(WD|NB|LB|B)$/.test(b)) body = 'bg-[#1E1E1C] border border-[#DA9811] text-white';
    else body = 'bg-[#2a2a28] text-[#E5E7EB]';

    const ring = isFh ? ' ring-2 ring-[#DA9811]' : '';
    return `${base} ${body}${ring}`;
  }

  public displayBall(ball: string): string {
    const raw = ball.replace(/\*$/, '');
    return raw === '0' ? '•' : raw;
  }

  public isFreeHit(ball: string): boolean {
    return ball.endsWith('*');
  }
}
