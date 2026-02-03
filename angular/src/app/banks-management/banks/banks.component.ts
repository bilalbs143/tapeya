import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { BanksService } from '../../shared/services/banks.service';
import { DialogData, MessageService } from '../../shared/services/message.service';

import { ManageBankDialogComponent } from './manage-bank-dialog/manage-bank-dialog.component';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  standalone: false,
})
export class BanksComponent implements AfterViewInit, OnInit {
  private banksService = inject(BanksService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'name', 'code', 'action'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe((): void => {
      this.loadHttpData();
    });
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      code: [''],
      is_active: [''],
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

  public openManageBankDialog(action: string, _row: any = {}): void {
    const data: DialogData = { record: _row, action };
    this.messageService.openDialog(ManageBankDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'sm',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_BANK',
      'WOULD_YOU_LIKE_TO_DELETE_THE_BANK',
      'DELETE',
      'CANCEL',
      (data: any): any => this.banksService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort)
      .set('direction', this.sort?.direction || '')
      .set('filter[name]', this.searchForm.value.name || '')
      .set('filter[code]', this.searchForm.value.code || '')
      .set('filter[is_active]', this.searchForm.value.is_active || '');

    this.isLoading = true;
    this.banksService
      .get(requestParams)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.dataSource.data = response.data || [];
          this.totalRecords = response.meta.total || 0;
        },
        error: (error: any) => {
          console.error('Error:', error);
        },
      });
  }

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }
}
