import { CommonModule, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { QuickMatchesService, type QuickMatchRow } from 'src/app/services/quick-matches.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { QuickMatchDetailDialogComponent } from './quick-match-detail-dialog/quick-match-detail-dialog.component';

const DEFAULT_FILTERS = {
  q: '',
  status: '',
  from_date: null as Date | null,
  to_date: null as Date | null,
} as const;

@Component({
  selector: 'app-quick-matches-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './quick-matches-list.component.html',
})
export class QuickMatchesListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly quickMatches = inject(QuickMatchesService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = ['sr', 'when', 'teams', 'creator', 'venue', 'format', 'status', 'actions'];
  public dataSource = new MatTableDataSource<QuickMatchRow>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  public readonly matchStatusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('match_status');

  constructor() {
    this.searchForm = this.fb.group({
      q: [DEFAULT_FILTERS.q],
      status: [DEFAULT_FILTERS.status],
      from_date: [DEFAULT_FILTERS.from_date],
      to_date: [DEFAULT_FILTERS.to_date],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.sub.add(
      this.sort?.sortChange.subscribe(() => {
        this.currentPage = 0;
        this.loadHttpData();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public resetSearchForm(): void {
    this.searchForm.reset({ ...DEFAULT_FILTERS });
    this.currentPage = 0;
    this.loadHttpData();
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;
    if (this.currentPage !== pageIndex || this.pageSize !== pageSize) {
      this.currentPage = pageIndex;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public loadHttpData(): void {
    const filters = this.searchForm.value;
    const fromDate = filters.from_date instanceof Date ? formatDate(filters.from_date, 'yyyy-MM-dd', 'en-US') : '';
    const toDate = filters.to_date instanceof Date ? formatDate(filters.to_date, 'yyyy-MM-dd', 'en-US') : '';

    this.isLoading = true;
    this.quickMatches
      .getList({
        page: this.currentPage + 1,
        per_page: this.pageSize,
        status: filters.status || undefined,
        q: (filters.q ?? '').trim() || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      })
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data ?? [];
          this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.error('Failed to load quick matches.');
        },
      });
  }

  public teamsLabel(row: QuickMatchRow): string {
    return `${row.home_team?.name ?? 'Home'} vs ${row.away_team?.name ?? 'Away'}`;
  }

  public openDetail(row: QuickMatchRow): void {
    this.messageService.openDialog<QuickMatchDetailDialogComponent, boolean>(
      QuickMatchDetailDialogComponent,
      { matchId: row.id },
      (changed) => {
        if (changed) this.loadHttpData();
      },
      { widthSize: 'md', disableClose: true }
    );
  }

  public cancelMatch(row: QuickMatchRow): void {
    if (row.status === 'completed' || row.status === 'cancelled') return;
    this.messageService.openPromptDialog(
      'Cancel Quick Match?',
      'This cancels the match for abuse or safety. Teams and players are kept.',
      'Cancel Match',
      'Keep',
      () => this.quickMatches.cancel(row.id),
      row,
      () => this.loadHttpData()
    );
  }
}
