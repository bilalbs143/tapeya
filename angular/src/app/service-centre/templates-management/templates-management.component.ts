import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { TemplatesManagementService } from '../../shared/services/templates-management.service';

import { ManageTemplatesDialogComponent } from './manage-templates-dialog/manage-templates-dialog.component';

@Component({
  selector: 'app-templates-management',
  templateUrl: './templates-management.component.html',
  standalone: false,
})
export class TemplatesManagementComponent implements AfterViewInit, OnInit {
  private translate = inject(TranslateService);
  private templatesManagementService = inject(TemplatesManagementService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'title', 'type', 'content', 'createdAt', 'action'];
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
      title: [''],
      type: [''],
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

  public openManageTemplatesDialog(action: string, _row: any = {}): void {
    const data: DialogData = { record: _row, action };
    this.messageService.openDialog(ManageTemplatesDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_TEMPLATE',
      'WOULD_YOU_LIKE_TO_DELETE_THE_TEMPLATE',
      'DELETE',
      'CANCEL',
      (data) => this.templatesManagementService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort)
      .set('filter[type]', this.searchForm.value.type || '')
      .set('filter[title]', this.searchForm.value.title || '');

    this.isLoading = true;
    this.templatesManagementService
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
