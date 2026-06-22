import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import { PlayersService } from 'src/app/services/players.service';
import type { User } from 'src/app/services/users.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ImportPlayersCsvDialogComponent } from './import-players-csv-dialog/import-players-csv-dialog.component';
import {
  ManagePlayerDialogComponent,
  type ManagePlayerDialogResult,
} from './manage-player-dialog/manage-player-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  phone: '',
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
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './players.component.html',
})
export class PlayersComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly playersService = inject(PlayersService);
  private readonly messageService = inject(MessageService);
  public readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

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
    'country',
    'city',
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
      phone: [DEFAULT_FILTERS.phone],
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
    const requestParams = buildListParams(this.currentPage, this.pageSize, this.sort ?? null, {
      search: (filters.search ?? '').trim(),
      phone: (filters.phone ?? '').trim(),
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
      { widthSize: 'lg', disableClose: true }
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
}
