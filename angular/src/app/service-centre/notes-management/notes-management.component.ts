import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { HtmlContentDialogComponent } from '../../shared/components/html-content-dialog/html-content-dialog.component';
import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, addUsernameFilter, baseHttpParams } from '../../shared/functions/core.function';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { NotesManagementService } from '../../shared/services/notes-management.service';

import { ManageNotesDialogComponent } from './manage-notes-dialog/manage-notes-dialog.component';

@Component({
  selector: 'app-notes-management',
  templateUrl: './notes-management.component.html',
  standalone: false,
})
export class NotesManagementComponent implements AfterViewInit, OnInit {
  private notesManagementService = inject(NotesManagementService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public categories: Array<any> = [];
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'name', 'username', 'category', 'title', 'createdAt', 'readAt', 'action'];
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
      username: [''],
      name: [''],
      created_before: [''],
      created_after: [''],
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

  public openManageTemplatesDialog(_row: any = {}): void {
    const data: DialogData = { record: _row };
    this.messageService.openDialog(ManageNotesDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_NOTE',
      'WOULD_YOU_LIKE_TO_DELETE_THE_NOTE',
      'DELETE',
      'CANCEL',
      (data) => this.notesManagementService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public openNotesContentDialog(content: string): void {
    const data: DialogData = { record: { content, title: 'NOTE_CONTENT' } };
    this.messageService.openDialog(HtmlContentDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'user.');
    requestParams = addCreatedFilter(requestParams, this.searchForm)
      .set('filter[note.category]', this.searchForm.value.category || '')
      .set('filter[note.title]', this.searchForm.value.title || '');

    this.isLoading = true;
    this.notesManagementService
      .users(requestParams)
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
    this.notesManagementService.categories().subscribe(
      (response) => {
        this.categories =
          Object.entries(response.data).map(([key, value]) => ({
            key,
            value,
          })) || [];
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
}
