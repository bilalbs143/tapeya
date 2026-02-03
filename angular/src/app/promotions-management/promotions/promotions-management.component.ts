import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { PromotionsService } from '../../shared/services/promotions.service';

import { ManagePromotionDialogComponent } from './manage-promotion-dialog/manage-promotion-dialog.component';

@Component({
  selector: 'app-promotions-management',
  templateUrl: './promotions-management.component.html',
  standalone: false,
})
export class PromotionsManagementComponent implements AfterViewInit, OnInit {
  private promotionsService = inject(PromotionsService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;

  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'name', 'type', 'status', 'validFrom', 'validTo', 'visible', 'action'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;
  public types: Array<any> = [];

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadTypes();
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      this.loadHttpData();
    });
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      type: [''],
      status: [''],
      is_visible: [''],
    });
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;

    if (this.currentPage !== pageIndex + 1 || this.pageSize !== pageSize) {
      this.currentPage = pageIndex + 1;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public openManageDialog(action: string, row: any = {}): void {
    const data: DialogData = { record: row, action };
    this.messageService.openDialog(ManagePromotionDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_PROMOTION',
      'WOULD_YOU_LIKE_TO_DELETE_THE_PROMOTION',
      'DELETE',
      'CANCEL',
      (data) => this.promotionsService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort)
      .set('filter[name]', this.searchForm.value.name || '')
      .set('filter[type]', this.searchForm.value.type || '')
      .set('filter[status]', this.searchForm.value.status || '')
      .set('filter[is_visible]', this.searchForm.value.is_visible || '');

    this.isLoading = true;
    this.promotionsService
      .get(requestParams)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data || [];
          this.totalRecords = response.meta?.total || 0;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }

  private loadTypes(): void {
    this.promotionsService.types().subscribe({
      next: (response) => {
        const data = response.data || {};
        this.types = Object.values(data);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
