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
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import { EventsService, type Event } from 'src/app/services/events.service';
import { MessageService } from 'src/app/services/message.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { EventDetailDialogComponent } from './event-detail-dialog/event-detail-dialog.component';
import { ManageEventDialogComponent } from './manage-event-dialog/manage-event-dialog.component';

const DEFAULT_FILTERS = {
  status: '',
  event_type: '',
  country: '',
  city: '',
} as const;

@Component({
  selector: 'app-events',
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
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly eventsService = inject(EventsService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public statusOptions$ = this.enumsService.getOptions('status');
  public eventTypeOptions$ = this.enumsService.getOptions('event_type');
  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'event_name',
    'event_type',
    'venue_name',
    'country',
    'city',
    'start_date',
    'end_date',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Event>([]);
  public readonly statusClass = getStatusClass;
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.initialiseSearchForm();
    this.pageSize = this.paginatorConfig.pageSize;
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      status: [DEFAULT_FILTERS.status],
      event_type: [DEFAULT_FILTERS.event_type],
      country: [DEFAULT_FILTERS.country],
      city: [DEFAULT_FILTERS.city],
    });
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
    const baseParams = buildListParams(page, perPage, this.sort ?? null, {
      status: filters.status ?? '',
    });
    const requestParams: Record<string, unknown> = { ...baseParams };
    if (filters.event_type) requestParams['filter[event_type]'] = filters.event_type;
    if (filters.country) requestParams['filter[country]'] = filters.country;
    if (filters.city) requestParams['filter[city]'] = filters.city;

    this.isLoading = true;
    this.eventsService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load events.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageEventDialogComponent, boolean>(
      ManageEventDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openDetailDialog(item: Event): void {
    this.messageService.openDialog<EventDetailDialogComponent, boolean>(
      EventDetailDialogComponent,
      { event: item },
      undefined,
      { widthSize: 'md' }
    );
  }

  public openEditDialog(item: Event): void {
    this.messageService.openDialog<ManageEventDialogComponent, boolean>(
      ManageEventDialogComponent,
      { mode: 'edit', event: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openDeleteDialog(item: Event): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Event?', `Are you sure you want to delete "${item.event_name}"?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.eventsService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete event.'),
            });
          }
        })
    );
  }
}
