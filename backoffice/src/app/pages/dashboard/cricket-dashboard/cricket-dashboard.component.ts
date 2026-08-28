import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';

import { MaterialModule } from 'src/app/material.module';
import type { CricketDashboardStats, LiveMatchRow, RecentMatchRow, TopTeamRow } from 'src/app/models/cricket-dashboard.models';
import { AuthService } from 'src/app/services/auth.service';
import { CricketDashboardService } from 'src/app/services/cricket/cricket-dashboard.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

@Component({
  selector: 'app-cricket-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, NgApexchartsModule, RouterLink, CommonSharedModule],
  templateUrl: './cricket-dashboard.component.html',
})
export class CricketDashboardComponent implements OnInit {
  private readonly dashboardService = inject(CricketDashboardService);
  private readonly auth = inject(AuthService);

  public readonly user = this.auth.currentUser;
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly stats = signal<CricketDashboardStats | null>(null);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  public readonly tournamentsTotal = computed(() => this.stats()?.tournaments_total ?? 0);
  public readonly tournamentsActive = computed(() => this.stats()?.tournaments_active ?? 0);
  public readonly matchesTotal = computed(() => this.stats()?.matches_total ?? 0);
  public readonly matchesCompleted = computed(() => this.stats()?.matches_completed ?? 0);
  public readonly teamsTotal = computed(() => this.stats()?.teams_total ?? 0);
  public readonly playersTotal = computed(() => this.stats()?.players_total ?? 0);

  // ── Phase / status breakdown ──────────────────────────────────────────────
  public readonly phaseCounts = computed(() => this.stats()?.phase_counts ?? { upcoming: 0, live: 0, completed: 0 });
  public readonly matchStatusCounts = computed(
    () =>
      this.stats()?.match_status_counts ?? {
        scheduled: 0,
        toss_done: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      }
  );

  // ── Format breakdowns ─────────────────────────────────────────────────────
  public readonly tournamentsByFormat = computed(() => this.stats()?.tournaments_by_format ?? []);
  public readonly matchesByFormat = computed(() => this.stats()?.matches_by_format ?? []);

  // ── Top teams ─────────────────────────────────────────────────────────────
  public readonly topTeamsByWins = computed(() => this.stats()?.top_teams_by_wins ?? []);
  public readonly topTeamsMaxWins = computed(() => this.topTeamsByWins().reduce((m, t) => Math.max(m, t.wins), 1));

  // ── Match activity (30d) ──────────────────────────────────────────────────
  public readonly matchActivityDates = computed(() => this.stats()?.match_activity_dates ?? []);
  public readonly matchActivityCounts = computed(() => this.stats()?.match_activity_counts ?? []);

  // ── Player growth (6 months) ──────────────────────────────────────────────
  public readonly playerGrowthLabels = computed(() => this.stats()?.player_growth_labels ?? []);
  public readonly playerGrowthCounts = computed(() => this.stats()?.player_growth_counts ?? []);

  // ── Tournament requests (6 months) ────────────────────────────────────────
  public readonly requestsMonthlyLabels = computed(() => this.stats()?.requests_monthly_labels ?? []);
  public readonly requestsMonthlyCounts = computed(() => this.stats()?.requests_monthly_counts ?? []);

  // ── Request pipeline ──────────────────────────────────────────────────────
  public readonly requestPipeline = computed(() => this.stats()?.request_pipeline ?? { pending: 0, approved: 0, rejected: 0 });

  // ── Active platform ─────────────────────────────────────────────────────────
  public readonly usersByActivePlatform = computed(() => this.stats()?.users_by_active_platform ?? []);
  public readonly appUsersTotal = computed(() => this.stats()?.app_users_total ?? 0);

  // ── Live / recent matches ─────────────────────────────────────────────────
  public readonly liveMatches = computed(() => this.stats()?.live_matches ?? []);
  public readonly recentMatches = computed(() => this.stats()?.recent_matches ?? []);
  public readonly recentRequests = computed(() => this.stats()?.recent_tournament_requests ?? []);

  // ── Derived computed signals for ApexCharts ───────────────────────────────

  public readonly phaseSeries = computed(() => [
    {
      name: 'Tournaments',
      data: [this.phaseCounts().upcoming, this.phaseCounts().live, this.phaseCounts().completed],
    },
  ]);

  public readonly matchStatusSeries = computed(() => {
    const s = this.matchStatusCounts();
    return [s.scheduled, s.toss_done, s.in_progress, s.completed, s.cancelled];
  });

  public readonly formatBarSeries = computed(() => [
    {
      name: 'Tournaments',
      data: this.tournamentsByFormat().map((f) => f.count),
    },
  ]);

  public readonly formatBarCategories = computed(() => this.tournamentsByFormat().map((f) => f.label));

  public readonly matchFormatSeries = computed(() => [
    {
      name: 'Matches',
      data: this.matchesByFormat().map((f) => f.count),
    },
  ]);

  public readonly matchFormatCategories = computed(() => this.matchesByFormat().map((f) => f.label));

  public readonly activitySeries = computed(() => [
    {
      name: 'Matches Created',
      data: this.matchActivityCounts(),
    },
  ]);

  public readonly playerGrowthSeries = computed(() => [
    {
      name: 'New Players',
      data: this.playerGrowthCounts(),
    },
  ]);

  public readonly requestsSeries = computed(() => [
    {
      name: 'Requests',
      data: this.requestsMonthlyCounts(),
    },
  ]);

  public readonly pipelineSeries = computed(() => {
    const p = this.requestPipeline();
    return [p.pending, p.approved, p.rejected];
  });

  public readonly platformSeries = computed(() => this.usersByActivePlatform().map((row) => row.count));

  public readonly platformLabels = computed(() => this.usersByActivePlatform().map((row) => row.label));

  // ── Chart configs (static — no signals needed) ────────────────────────────

  public readonly phaseBarChart = {
    type: 'bar' as const,
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit',
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly phaseBarPlotOptions = {
    bar: { horizontal: false, columnWidth: '52%', borderRadius: 6, distributed: true },
  };

  public readonly phaseBarDataLabels = {
    enabled: true,
    offsetY: -4,
    style: { fontSize: '12px', fontWeight: 600 },
  };

  public readonly phaseBarXaxis = {
    categories: ['Upcoming', 'Live', 'Completed'],
    labels: { style: { fontSize: '12px', colors: 'var(--mat-sys-on-surface-variant)' } },
  };

  public readonly phaseBarYaxis = {
    decimalsInFloat: 0,
    labels: { style: { colors: 'var(--mat-sys-on-surface-variant)' }, formatter: (v: number) => String(Math.round(v)) },
  };

  public readonly phaseBarColors = ['var(--mat-sys-primary)', 'var(--mat-sys-secondary)', 'var(--mat-sys-tertiary)'];
  public readonly phaseBarLegend = { show: false };

  public readonly matchStatusDonutChart = {
    type: 'donut' as const,
    height: 280,
    fontFamily: 'inherit',
    toolbar: { show: false },
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly matchStatusLabels = ['Scheduled', 'Toss Done', 'In Progress', 'Completed', 'Cancelled'];

  public readonly matchStatusColors = [
    'var(--mat-sys-primary)',
    'var(--mat-sys-tertiary)',
    'var(--color-warning)',
    'var(--color-success)',
    'var(--mat-sys-error)',
  ];

  public readonly matchStatusDonutLegend = {
    position: 'bottom' as const,
    fontSize: '12px',
    labels: { colors: 'var(--mat-sys-on-surface-variant)' },
  };

  public readonly matchStatusPlotOptions = {
    pie: {
      donut: {
        size: '62%',
        labels: {
          show: true,
          name: { color: 'var(--mat-sys-on-surface-variant)' },
          value: { color: 'var(--mat-sys-on-surface)' },
          total: {
            show: true,
            label: 'Matches',
            color: 'var(--mat-sys-on-surface-variant)',
            formatter: (w: { globals: { seriesTotals: number[] } }): string =>
              String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
          },
        },
      },
    },
  };

  public readonly donutPercentDataLabels = {
    enabled: true,
    formatter: (val: string | number | number[] | undefined): string => {
      const n = Array.isArray(val) ? 0 : Number(val ?? 0);
      return n > 0 ? `${n.toFixed(1)}%` : '';
    },
  };

  public readonly matchStatusDataLabels = this.donutPercentDataLabels;
  public readonly platformDataLabels = this.donutPercentDataLabels;

  public readonly formatBarChart = {
    type: 'bar' as const,
    height: 240,
    toolbar: { show: false },
    fontFamily: 'inherit',
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly formatBarPlotOptions = {
    bar: { horizontal: true, barHeight: '55%', borderRadius: 4 },
  };

  public readonly formatBarDataLabels = { enabled: false };

  public readonly formatBarYaxis = {
    labels: { style: { colors: 'var(--mat-sys-on-surface-variant)', fontSize: '12px' } },
  };

  public readonly formatBarColors = ['var(--mat-sys-primary)'];
  public readonly matchFormatColors = ['var(--mat-sys-secondary)'];

  public readonly activityAreaChart = {
    type: 'area' as const,
    height: 240,
    toolbar: { show: false },
    fontFamily: 'inherit',
    foreColor: 'var(--mat-sys-on-surface-variant)',
    zoom: { enabled: false },
  };

  public readonly activityAreaStroke = { curve: 'smooth' as const, width: 2 };

  public readonly activityAreaFill = {
    type: 'gradient',
    gradient: { shadeIntensity: 0.1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
  };

  public readonly activityAreaColors = ['var(--mat-sys-primary)'];

  public readonly activityAreaYaxis = {
    decimalsInFloat: 0,
    labels: { style: { colors: 'var(--mat-sys-on-surface-variant)' }, formatter: (v: number) => String(Math.round(v)) },
  };

  public readonly playerGrowthBarChart = {
    type: 'bar' as const,
    height: 240,
    toolbar: { show: false },
    fontFamily: 'inherit',
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly playerGrowthBarPlotOptions = {
    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
  };

  public readonly playerGrowthBarColors = ['var(--mat-sys-tertiary)'];

  public readonly requestsLineChart = {
    type: 'line' as const,
    height: 240,
    toolbar: { show: false },
    fontFamily: 'inherit',
    foreColor: 'var(--mat-sys-on-surface-variant)',
    zoom: { enabled: false },
  };

  public readonly requestsLineStroke = { curve: 'smooth' as const, width: 2 };
  public readonly requestsLineColors = ['var(--mat-sys-secondary)'];

  public readonly pipelineDonutChart = {
    type: 'donut' as const,
    height: 180,
    fontFamily: 'inherit',
    toolbar: { show: false },
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly pipelineLabels = ['Pending', 'Approved', 'Rejected'];

  public readonly pipelineColors = ['var(--color-warning)', 'var(--color-success)', 'var(--mat-sys-error)'];

  public readonly pipelineLegend = {
    position: 'bottom' as const,
    fontSize: '11px',
    labels: { colors: 'var(--mat-sys-on-surface-variant)' },
  };

  public readonly pipelinePlotOptions = {
    pie: {
      donut: {
        size: '55%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            color: 'var(--mat-sys-on-surface-variant)',
            formatter: (w: { globals: { seriesTotals: number[] } }): string =>
              String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
          },
        },
      },
    },
  };

  public readonly platformDonutChart = {
    type: 'donut' as const,
    height: 240,
    fontFamily: 'inherit',
    toolbar: { show: false },
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly platformColors = [
    'var(--mat-sys-primary)',
    'var(--mat-sys-secondary)',
    'var(--color-success)',
    'var(--mat-sys-outline-variant)',
  ];

  public readonly platformLegend = {
    position: 'bottom' as const,
    fontSize: '11px',
    labels: { colors: 'var(--mat-sys-on-surface-variant)' },
  };

  public readonly platformPlotOptions = {
    pie: {
      donut: {
        size: '58%',
        labels: {
          show: true,
          name: { color: 'var(--mat-sys-on-surface-variant)' },
          value: { color: 'var(--mat-sys-on-surface)' },
          total: {
            show: true,
            label: 'Users',
            color: 'var(--mat-sys-on-surface-variant)',
            formatter: (w: { globals: { seriesTotals: number[] } }): string =>
              String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
          },
        },
      },
    },
  };

  public readonly chartGrid = { strokeDashArray: 4, borderColor: 'var(--mat-sys-outline-variant)' };

  // ── Helpers ───────────────────────────────────────────────────────────────

  public ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message ?? 'Failed to load dashboard stats.');
      },
    });
  }

  public hasSeries(series: number[]): boolean {
    return series?.some((v) => v > 0) ?? false;
  }

  public hasFormatData(): boolean {
    return this.tournamentsByFormat().length > 0;
  }

  public hasMatchFormatData(): boolean {
    return this.matchesByFormat().length > 0;
  }

  public hasActivityData(): boolean {
    return this.hasSeries(this.matchActivityCounts());
  }

  public hasPlayerGrowthData(): boolean {
    return this.hasSeries(this.playerGrowthCounts());
  }

  public hasRequestsData(): boolean {
    return this.hasSeries(this.requestsMonthlyCounts());
  }

  public hasPipelineData(): boolean {
    return this.hasSeries(this.pipelineSeries());
  }

  public hasPlatformData(): boolean {
    return this.appUsersTotal() > 0 && this.hasSeries(this.platformSeries());
  }

  public hasMatchStatusData(): boolean {
    return this.hasSeries(this.matchStatusSeries());
  }

  public hasPhaseData(): boolean {
    return this.hasSeries(this.phaseSeries()[0]?.data ?? []);
  }

  public matchResultLine(m: RecentMatchRow): string {
    if (m.is_no_result) return 'No result';
    if (!m.winner) return '—';
    if (m.win_by_runs != null && m.win_by_runs > 0) return `${m.winner} won by ${m.win_by_runs} run(s)`;
    if (m.win_by_wickets != null && m.win_by_wickets > 0) return `${m.winner} won by ${m.win_by_wickets} wkt(s)`;
    return `${m.winner} won`;
  }

  public requestStatusClass(status: string | null): string {
    switch (status) {
      case 'approved':
        return 'text-success';
      case 'rejected':
        return 'text-error';
      default:
        return 'text-warning';
    }
  }

  public formatDate(iso: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  public maxWins(teams: TopTeamRow[]): number {
    return teams.reduce((m, t) => Math.max(m, t.wins), 1);
  }

  public winBarWidth(wins: number, max: number): string {
    return `${Math.round((wins / Math.max(max, 1)) * 100)}%`;
  }

  public liveMatchSubtitle(m: LiveMatchRow): string {
    const parts: string[] = [];
    if (m.overs) parts.push(`${m.overs} ov`);
    if (m.match_date) parts.push(this.formatDate(m.match_date));
    return parts.join(' · ');
  }
}
