import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { BlacklistedIpsManagementService } from '../../shared/services/blacklisted-ips-management.service';
import { DialogData, MessageService } from '../../shared/services/message.service';

import { ManageBlacklistedIpsDialogComponent } from './manage-blacklisted-ips-dialog/manage-blacklisted-ips-dialog.component';

@Component({
  selector: 'app-blacklisted-ips-management',
  templateUrl: './blacklisted-ips-management.component.html',
  standalone: false,
})
export class BlacklistedIpsManagementComponent implements AfterViewInit, OnInit {
  private blacklistIpsManagementService = inject(BlacklistedIpsManagementService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'ip', 'memo', 'createdAt', 'action'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.initialiseSearchForm();
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
      ip_address: [''],
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

  public openManageBlacklistIpsDialog(action: string, _row: any = {}): void {
    const data: DialogData = { record: _row, action };
    this.messageService.openDialog(ManageBlacklistedIpsDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'md',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_BLACKLISTED_IP_ADDRESS',
      'WOULD_YOU_LIKE_TO_DELETE_THE_BLACKLISTED_IP_ADDRESS',
      'DELETE',
      'CANCEL',
      (data) => this.blacklistIpsManagementService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort).set(
      'filter[ip]',
      this.searchForm.value.ip_address || ''
    );

    this.isLoading = true;
    this.blacklistIpsManagementService
      .get(requestParams)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data || [];
          this.totalRecords = response.meta.total || 0;
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
}
