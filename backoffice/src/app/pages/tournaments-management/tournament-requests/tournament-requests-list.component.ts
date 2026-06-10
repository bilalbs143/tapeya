import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, Subscription } from 'rxjs';

import { ManageTournamentDialogComponent } from '../tournaments/manage-tournament-dialog/manage-tournament-dialog.component';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { TournamentRequest } from 'src/app/services/tournament-request.service';
import { TournamentRequestService } from 'src/app/services/tournament-request.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { TournamentRequestDetailDialogComponent } from './tournament-request-detail-dialog/tournament-request-detail-dialog.component';

const DEFAULT_FILTERS = { contact_phone: '', status: '', tournament_type: '' } as const;

@Component({
  selector: 'app-tournament-requests-list',
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
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './tournament-requests-list.component.html',
})
export class TournamentRequestsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly tournamentRequestService = inject(TournamentRequestService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'tournament_name',
    'contact_person',
    'contact_phone',
    'tournament_type',
    'venue',
    'prize',
    'country',
    'city',
    'start_date',
    'end_date',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<TournamentRequest>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('tournament_request_status');
  public tournamentTypeOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('tournament_type');

  constructor() {
    this.searchForm = this.fb.group({
      contact_phone: [DEFAULT_FILTERS.contact_phone],
      status: [DEFAULT_FILTERS.status],
      tournament_type: [DEFAULT_FILTERS.tournament_type],
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

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    let params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: filters.status ?? '',
      }),
    } as Record<string, unknown>;
    if ((filters.contact_phone ?? '').trim() !== '') {
      params = { ...params, 'filter[contact_phone]': (filters.contact_phone as string).trim() };
    }
    if ((filters.tournament_type ?? '').trim() !== '') {
      params = { ...params, 'filter[tournament_type]': (filters.tournament_type as string).trim() };
    }
    this.isLoading = true;
    this.tournamentRequestService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load tournament requests.');
      },
    });
  }

  public openDetailDialog(request: TournamentRequest): void {
    this.messageService.openDialog<TournamentRequestDetailDialogComponent, boolean>(
      TournamentRequestDetailDialogComponent,
      { tournamentRequest: request },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openCreateTournamentDialog(request: TournamentRequest): void {
    this.messageService.openDialog<ManageTournamentDialogComponent, boolean>(
      ManageTournamentDialogComponent,
      { mode: 'create', fromRequest: request },
      (result) => {
        if (result) {
          this.tournamentRequestService.updateStatus(request.id, 'approved').subscribe({
            next: () => {
              void this.router.navigate(['/tournaments-management/tournaments']);
            },
            error: () => {
              this.loadHttpData();
              this.messageService.error('Tournament created but failed to approve request.');
            },
          });
        }
      },
      { widthSize: 'md', disableClose: true }
    );
  }
}
