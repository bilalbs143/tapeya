import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { type Highlight, HighlightService } from 'src/app/services/highlight.service';
import { MessageService } from 'src/app/services/message.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageHighlightDialogComponent } from './manage-highlight-dialog/manage-highlight-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
} as const;

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableImageComponent,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './highlights.component.html',
})
export class HighlightsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly highlightService = inject(HighlightService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm!: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'thumbnail',
    'title',
    'duration',
    'views_count',
    'likes_count',
    'is_active',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Highlight>([]);
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({ search: [DEFAULT_FILTERS.search] });
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
    const requestParams = buildListParams(page, perPage, this.sort ?? null, {
      search: filters.search ?? '',
    });

    this.isLoading = true;
    this.highlightService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load highlights.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageHighlightDialogComponent, boolean>(
      ManageHighlightDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'lg', disableClose: true }
    );
  }

  public openEditDialog(item: Highlight): void {
    this.messageService.openDialog<ManageHighlightDialogComponent, boolean>(
      ManageHighlightDialogComponent,
      { mode: 'edit', highlight: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'lg', disableClose: true }
    );
  }

  public openDeleteDialog(item: Highlight): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Highlight?', `Are you sure you want to delete "${item.title}"?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.highlightService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete highlight.'),
            });
          }
        })
    );
  }
}
