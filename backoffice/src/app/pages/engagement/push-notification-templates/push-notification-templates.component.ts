import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
import { map, Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { type PushNotificationTemplate, PushNotificationService } from 'src/app/services/push-notification.service';
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

import { ManagePushTemplateDialogComponent } from './manage-push-template-dialog/manage-push-template-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  is_active: '',
} as const;

@Component({
  selector: 'app-push-notification-templates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './push-notification-templates.component.html',
})
export class PushNotificationTemplatesComponent implements OnInit, OnDestroy {
  private readonly pushService = inject(PushNotificationService);
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
  public statusOptions$: Observable<EnumOption[]> = this.enumsService
    .getOptions('status')
    .pipe(map((opts) => [{ value: '', label: 'All' }, ...opts]));
  public readonly displayedColumns: string[] = ['sr', 'name', 'title_template', 'is_active', 'updated_at', 'actions'];
  public dataSource = new MatTableDataSource<PushNotificationTemplate>([]);
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.pageSize = this.paginatorConfig.pageSize;
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      is_active: [DEFAULT_FILTERS.is_active],
    });
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

  private mapStatusToIsActive(value: string | undefined): string | null {
    if (value === 'active') return '1';
    if (value === 'inactive') return '0';
    return null;
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public formatDate(value: string | null | undefined): string {
    if (!value) {
      return this.emptyCell;
    }

    return format(new Date(value), 'dd MMM yyyy, HH:mm');
  }

  public openEditDialog(template: PushNotificationTemplate): void {
    if (!template.is_editable) {
      this.messageService.error('Manual broadcast templates are not editable. Use Send Notification instead.');
      return;
    }

    this.messageService.openDialog<ManagePushTemplateDialogComponent, boolean>(
      ManagePushTemplateDialogComponent,
      { template },
      (saved) => saved && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;

    const params = {
      ...buildListParams(page, perPage, this.sort?.active ? this.sort : { active: 'name', direction: 'asc' }),
    } as Record<string, unknown>;

    const statusFilter = this.mapStatusToIsActive(filters.is_active);
    if (statusFilter !== null) {
      params['filter[is_active]'] = statusFilter;
    }
    if ((filters.search ?? '').trim() !== '') {
      params['filter[search]'] = (filters.search as string).trim();
    }

    this.isLoading = true;
    this.sub.add(
      this.pushService.getTemplates(params).subscribe({
        next: (res) => {
          this.dataSource.data = res.data ?? [];
          this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.messageService.error('Failed to load push notification templates.');
          this.isLoading = false;
        },
      })
    );
  }
}
