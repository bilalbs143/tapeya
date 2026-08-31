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
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
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

import { ImportPlayersCsvDialogComponent } from './import-players-csv-dialog/import-players-csv-dialog.component';
import {
  ManagePlayerDialogComponent,
  type ManagePlayerDialogResult,
} from './manage-player-dialog/manage-player-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  active_platform: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

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
    RouterLink,
  ],
  templateUrl: './players.component.html',
})
export class PlayersComponent implements OnInit, OnDestroy {
  private readonly playersService = inject(PlayersService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  public readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public platformOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('active_platform');
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('user_status');

  private readonly sortBinder = new SortReloadBinder(this);

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
    'referral_nickname',
    'email',
    'phone',
    'date_of_birth',
    'playing_role',
    'bowling_style',
    'batting_style',
    'location',
    'active_platform',
    'actions',
  ];
  public dataSource = new MatTableDataSource<User>([]);
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
      active_platform: [DEFAULT_FILTERS.active_platform],
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

  public loadHttpData(): void {
    const filters = this.searchForm.value;
    const requestParams = buildListParams(this.currentPage, this.pageSize, this.sort ?? null, {
      search: (filters.search ?? '').trim(),
      status: filters.status ?? '',
      active_platform: filters.active_platform ?? '',
      created_after: filters.created_after ? format(filters.created_after, 'yyyy-MM-dd') : undefined,
      created_before: filters.created_before ? format(filters.created_before, 'yyyy-MM-dd') : undefined,
    });

    this.isLoading = true;
    this.playersService.getList(requestParams).subscribe({
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

  public openCreateDialog(): void {
    this.messageService.openDialog<ManagePlayerDialogComponent, ManagePlayerDialogResult>(
      ManagePlayerDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openImportPlayersCsvDialog(): void {
    this.messageService.openDialog<ImportPlayersCsvDialogComponent, boolean>(
      ImportPlayersCsvDialogComponent,
      {},
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(user: User): void {
    this.messageService.openDialog<ManagePlayerDialogComponent, ManagePlayerDialogResult>(
      ManagePlayerDialogComponent,
      { mode: 'edit', user },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public cityCountryLine(user: User): string {
    return cityCountryLine(user.city, user.country);
  }
}
