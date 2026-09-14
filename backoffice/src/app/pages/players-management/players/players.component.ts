import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import type { EnumOption } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { PlayersService } from 'src/app/services/players.service';
import type { User } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { cityCountryLine } from 'src/app/shared/functions/display.helper';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ensureFakePlayersCached, isFakePlayer, type PlayerListRow } from './fake-players.util';
import { ImportPlayersCsvDialogComponent } from './import-players-csv-dialog/import-players-csv-dialog.component';
import {
  ManagePlayerDialogComponent,
  type ManagePlayerDialogResult,
} from './manage-player-dialog/manage-player-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  active_platform: '',
  inactive_days: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

/** Unlock real-only list: /players-management/players?q=tapeya-players */
const REAL_PLAYERS_QUERY = 'tapeya-players';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './players.component.html',
})
export class PlayersComponent implements OnInit, OnDestroy {
  private readonly playersService = inject(PlayersService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();
  private readonly sortBinder = new SortReloadBinder(this);

  public platformOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('active_platform');
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('user_status');

  /**
   * Default `/players-management/players` = demo list (reals + client fakes).
   * `?q=` matching this value = real players only (server pagination).
   */
  public isFakeListMode = true;
  private demoAllRows: PlayerListRow[] = [];
  private needsDemoReload = true;

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'name',
    'nickname',
    'email',
    'phone',
    'date_of_birth',
    'playing_role',
    'bowling_style',
    'batting_style',
    'location',
    'active_platform',
    'last_active_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<PlayerListRow>([]);
  public readonly emptyCell = EMPTY_CELL;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({ ...DEFAULT_FILTERS });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q != null && q !== '') {
      if (q !== REAL_PLAYERS_QUERY) {
        // Wrong secret → public demo URL
        void this.router.navigate(['/players-management/players'], { replaceUrl: true });
        return;
      }
      // Correct secret → real players only
      this.isFakeListMode = false;
    } else {
      this.isFakeListMode = true;
      // Warm fake cache while the all=true API request is in flight.
      void ensureFakePlayersCached();
    }

    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadHttpData();
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  public resetSearchForm(): void {
    resetListSearchForm(this, DEFAULT_FILTERS);
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public loadHttpData(): void {
    if (this.isFakeListMode) {
      this.loadDemoModeData();
      return;
    }

    const filters = this.searchForm.value;
    this.isLoading = true;
    this.playersService
      .getList(
        buildListParams(this.currentPage, this.pageSize, this.sort ?? null, {
          search: (filters.search ?? '').trim(),
          status: filters.status ?? '',
          active_platform: filters.active_platform ?? '',
          inactive_days: filters.inactive_days ?? '',
          created_after: filters.created_after ? format(filters.created_after, 'yyyy-MM-dd') : undefined,
          created_before: filters.created_before ? format(filters.created_before, 'yyyy-MM-dd') : undefined,
        })
      )
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data ?? [];
          this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.error('Failed to Load Players.');
        },
      });
  }

  private loadDemoModeData(): void {
    if (this.demoAllRows.length > 0 && !this.needsDemoReload) {
      this.applyDemoPage();
      return;
    }

    this.isLoading = true;
    const fakesReady = ensureFakePlayersCached();
    this.playersService.getList({ all: true }).subscribe({
      next: (res) => {
        void fakesReady
          .then((fakes) => {
            const real = ((res.data ?? []) as PlayerListRow[]).filter((row) => {
              const country = (row.country ?? '').trim().toLowerCase();
              return !country || country === 'pakistan';
            });
            this.demoAllRows = real.concat(fakes);
            this.needsDemoReload = false;
            this.applyDemoPage();
            this.isLoading = false;
          })
          .catch(() => {
            this.isLoading = false;
            this.messageService.error('Failed to Load Players.');
          });
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to Load Players.');
      },
    });
  }

  private applyDemoPage(): void {
    const filtered = this.filterDemoRows(this.demoAllRows);
    const sorted = this.sortDemoRows(filtered);
    this.totalRecords = sorted.length;
    const start = this.currentPage * this.pageSize;
    this.dataSource.data = sorted.slice(start, start + this.pageSize);
  }

  private filterDemoRows(rows: PlayerListRow[]): PlayerListRow[] {
    const filters = this.searchForm.value;
    const search = ((filters.search as string) ?? '').trim().toLowerCase();
    const status = (filters.status as string) ?? '';
    const platform = (filters.active_platform as string) ?? '';
    const inactiveDaysRaw = (filters.inactive_days as string) ?? '';
    const inactiveDays = inactiveDaysRaw ? Number(inactiveDaysRaw) : 0;
    const after: Date | null = filters.created_after ?? null;
    const before: Date | null = filters.created_before ?? null;

    return rows.filter((row) => {
      if (search) {
        const hay = `${row.name ?? ''} ${row.nickname ?? ''} ${row.email ?? ''} ${row.phone ?? ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (status && row.status_enum !== status) return false;
      if (platform === 'untracked') {
        if (row.active_platform) return false;
      } else if (platform && row.active_platform !== platform) {
        return false;
      }
      if (inactiveDays > 0) {
        const cutoff = Date.now() - inactiveDays * 86_400_000;
        const at = row.last_active_at ? new Date(row.last_active_at).getTime() : null;
        if (at != null && !Number.isNaN(at) && at > cutoff) return false;
      }
      if (after || before) {
        const created = row.created_at ? new Date(row.created_at) : null;
        if (!created || Number.isNaN(created.getTime())) return false;
        if (after) {
          const start = new Date(after);
          start.setHours(0, 0, 0, 0);
          if (created < start) return false;
        }
        if (before) {
          const end = new Date(before);
          end.setHours(23, 59, 59, 999);
          if (created > end) return false;
        }
      }
      return true;
    });
  }

  private sortDemoRows(rows: PlayerListRow[]): PlayerListRow[] {
    const active = this.sort?.active;
    const dir = this.sort?.direction;
    if (!active || !dir) return rows;

    const mul = dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[active as keyof PlayerListRow];
      const bv = b[active as keyof PlayerListRow];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul;
      if (typeof av === 'boolean' && typeof bv === 'boolean') return (Number(av) - Number(bv)) * mul;
      if ((typeof av === 'string' || typeof av === 'number') && (typeof bv === 'string' || typeof bv === 'number')) {
        return String(av).localeCompare(String(bv)) * mul;
      }
      return 0;
    });
  }

  private afterRealMutation(result: unknown): void {
    if (!result) return;
    this.needsDemoReload = true;
    this.loadHttpData();
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManagePlayerDialogComponent, ManagePlayerDialogResult>(
      ManagePlayerDialogComponent,
      { mode: 'create' },
      (result) => this.afterRealMutation(result),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openImportPlayersCsvDialog(): void {
    this.messageService.openDialog<ImportPlayersCsvDialogComponent, boolean>(
      ImportPlayersCsvDialogComponent,
      {},
      (result) => this.afterRealMutation(result),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(user: User): void {
    if (isFakePlayer(user)) return;
    this.messageService.openDialog<ManagePlayerDialogComponent, ManagePlayerDialogResult>(
      ManagePlayerDialogComponent,
      { mode: 'edit', user },
      (result) => this.afterRealMutation(result),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openPlayerStats(user: User): void {
    if (isFakePlayer(user)) return;
    void this.router.navigate(['/players-management/players', user.id, 'stats']);
  }

  public openBroadcastBanDialog(user: User): void {
    if (isFakePlayer(user)) return;
    this.sub.add(
      this.messageService
        .prompt(
          'Ban Broadcaster?',
          `${user.name} will lose broadcast access and any active broadcast will be ended immediately. Continue?`,
          'Ban',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (!confirmed) return;
          this.playersService.banBroadcaster(user.id).subscribe({
            next: () => this.afterRealMutation(true),
            error: () => this.messageService.error('Failed to revoke broadcast access.'),
          });
        })
    );
  }

  public formatLastActive(iso: string | null | undefined): string {
    if (!iso) return 'Never';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Never';
    return formatDistanceToNowStrict(d, { addSuffix: true });
  }

  public cityCountryLine(user: User): string {
    return cityCountryLine(user.city, user.country);
  }
}
