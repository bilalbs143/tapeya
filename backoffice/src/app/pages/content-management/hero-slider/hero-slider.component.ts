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
import { HeroSliderService, type HeroSlider } from 'src/app/services/hero-slider.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { ManageHeroSliderDialogComponent } from './manage-hero-slider-dialog/manage-hero-slider-dialog.component';

const DEFAULT_FILTERS = {
  status: '',
} as const;

@Component({
  selector: 'app-hero-slider',
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
    TableImageComponent,
    CommonSharedModule,
  ],
  templateUrl: './hero-slider.component.html',
})
export class HeroSliderComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly heroSliderService = inject(HeroSliderService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public statusOptions$ = this.enumsService.getOptions('status');
  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'image_mobile',
    'image_desktop',
    'cta_label',
    'status',
    'created_at',
    'updated_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<HeroSlider>([]);
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
    const requestParams = buildListParams(page, perPage, this.sort ?? null, {
      status: filters.status ?? '',
    });

    this.isLoading = true;
    this.heroSliderService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed To Load Hero Sliders.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageHeroSliderDialogComponent, boolean>(
      ManageHeroSliderDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'lg',
        disableClose: true,
      }
    );
  }

  public openEditDialog(item: HeroSlider): void {
    this.messageService.openDialog<ManageHeroSliderDialogComponent, boolean>(
      ManageHeroSliderDialogComponent,
      { mode: 'edit', heroSlider: item },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'lg',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(item: HeroSlider): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Hero Slider?', `Are You Sure You Want To Delete This Slide?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.heroSliderService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed To Delete Hero Slider.'),
            });
          }
        })
    );
  }
}
