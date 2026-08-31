import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { SupportMessage } from 'src/app/services/support-message.service';
import { SupportMessageService } from 'src/app/services/support-message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageSupportMessageDialogComponent } from './manage-support-message-dialog/manage-support-message-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

@Component({
  selector: 'app-support-messages',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './support-messages-list.component.html',
})
export class SupportMessagesListComponent implements OnInit, OnDestroy {
  private readonly supportMessageService = inject(SupportMessageService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  private readonly sortBinder = new SortReloadBinder(this);

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public searchForm!: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'name',
    'phone',
    'message',
    'attachment',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<SupportMessage>([]);
  public readonly emptyCell = EMPTY_CELL;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('support_message_status');

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
      created_after: [DEFAULT_FILTERS.created_after],
      created_before: [DEFAULT_FILTERS.created_before],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
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

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    const params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        search: (filters.search ?? '').trim(),
        status: filters.status ?? '',
        created_after: filters.created_after ? format(filters.created_after, 'yyyy-MM-dd') : undefined,
        created_before: filters.created_before ? format(filters.created_before, 'yyyy-MM-dd') : undefined,
      }),
    } as Record<string, unknown>;

    this.isLoading = true;
    this.supportMessageService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load support messages.');
      },
    });
  }

  public submitterLabel(item: SupportMessage): string {
    return item.user?.name || item.name || this.emptyCell;
  }

  public openUpdateDialog(item: SupportMessage): void {
    this.messageService.openDialog<ManageSupportMessageDialogComponent, boolean>(
      ManageSupportMessageDialogComponent,
      { message: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }
}
