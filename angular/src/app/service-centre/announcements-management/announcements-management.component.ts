import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { AnnouncementsManagementService } from '../../shared/services/announcements-management.service';
import { DialogData, MessageService } from '../../shared/services/message.service';

import { ManageAnnouncementsDialogComponent } from './manage-announcements-dialog/manage-announcements-dialog.component';
import { ManageImportantAnnouncementDialogComponent } from './manage-important-announcement-dialog/manage-important-announcement-dialog.component';

@Component({
  selector: 'app-announcements-management',
  templateUrl: './announcements-management.component.html',
  standalone: false,
})
export class AnnouncementsManagementComponent implements AfterViewInit, OnInit {
  private announcementsManagementService = inject(AnnouncementsManagementService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public categories: Array<any> = [];
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'category', 'title', 'content', 'createdAt', 'action'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.getAllCategories();
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
      category: [''],
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
    this.messageService.openDialog(ManageAnnouncementsDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public openImportantAnnouncementDialog(): void {
    this.messageService.openDialog(ManageImportantAnnouncementDialogComponent, {}, () => this.loadHttpData(), {
      widthSize: 'md',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_ANNOUNCEMENT',
      'WOULD_YOU_LIKE_TO_DELETE_THE_ANNOUNCEMENT',
      'DELETE',
      'CANCEL',
      (data) => this.announcementsManagementService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    this.isLoading = true;
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort)
      .set('filter[category]', this.searchForm.value.category || '')
      .set('filter[title]', this.searchForm.value.title || '');

    this.announcementsManagementService
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

  private getAllCategories(): void {
    this.announcementsManagementService.categories().subscribe({
      next: (response) => {
        this.categories =
          Object.entries(response.data).map(([key, value]) => ({
            key,
            value,
          })) || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
