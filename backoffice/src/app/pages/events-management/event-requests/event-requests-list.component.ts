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
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import type { EventRequest } from 'src/app/services/event-request.service';
import { EventRequestService } from 'src/app/services/event-request.service';
import { MessageService } from 'src/app/services/message.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { EventRequestDetailDialogComponent } from './event-request-detail-dialog/event-request-detail-dialog.component';

const DEFAULT_FILTERS = { contact_phone: '', status: '', event_type: '' } as const;

@Component({
  selector: 'app-event-requests-list',
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
  templateUrl: './event-requests-list.component.html',
})
export class EventRequestsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly eventRequestService = inject(EventRequestService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'event_name',
    'contact_person',
    'contact_phone',
    'event_type',
    'venue',
    'start_date',
    'end_date',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<EventRequest>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('event_request_status');
  public eventTypeOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('event_type');

  constructor() {
    this.searchForm = this.fb.group({
      contact_phone: [DEFAULT_FILTERS.contact_phone],
      status: [DEFAULT_FILTERS.status],
      event_type: [DEFAULT_FILTERS.event_type],
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
    if ((filters.event_type ?? '').trim() !== '') {
      params = { ...params, 'filter[event_type]': (filters.event_type as string).trim() };
    }
    this.isLoading = true;
    this.eventRequestService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load event requests.');
      },
    });
  }

  public openDetailDialog(request: EventRequest): void {
    this.messageService.openDialog<EventRequestDetailDialogComponent, boolean>(
      EventRequestDetailDialogComponent,
      { eventRequest: request },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }
}
