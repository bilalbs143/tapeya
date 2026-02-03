import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, addUsernameFilter, baseHttpParams } from '../../shared/functions/core.function';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { QuickAccountInquiriesService } from '../../shared/services/quick-account-inquiries.service';

import { ManageAccountInfoDialogComponent } from './manage-account-info-dialog/manage-account-info-dialog.component';

@Component({
  selector: 'app-quick-account-inquiries',
  templateUrl: './quick-account-inquiries.component.html',
  standalone: false,
})
export class QuickAccountInquiriesComponent implements AfterViewInit, OnInit {
  private translate = inject(TranslateService);
  private quickAccountInquiresService = inject(QuickAccountInquiriesService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'name', 'username', 'phoneNumber', 'message', 'createdAt'];
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
      username: [''],
      name: [''],
      created_before: [''],
      created_after: [''],
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

  public openManageAccountInfoDialog(): void {
    const data: DialogData = { record: {}, action: '' };
    this.messageService.openDialog(ManageAccountInfoDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addUsernameFilter(requestParams, this.searchForm);
    requestParams = addCreatedFilter(requestParams, this.searchForm, 'authenticatable.');

    this.isLoading = true;
    this.quickAccountInquiresService
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
