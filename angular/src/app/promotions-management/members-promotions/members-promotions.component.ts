import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { MessageService } from '../../shared/services/message.service';
import { PromotionsService } from '../../shared/services/promotions.service';

@Component({
  selector: 'app-members-promotions',
  templateUrl: './members-promotions.component.html',
  standalone: false,
})
export class MembersPromotionsComponent implements AfterViewInit, OnInit {
  private promotionsService = inject(PromotionsService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;

  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'user', 'promotion', 'state', 'turnover', 'net', 'activated', 'completed'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;
  public promotions: Array<any> = [];

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadPromotions();
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
      promotion_id: [''],
      state: [''],
      username: [''],
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

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort)
      .set('filter[promotion_id]', this.searchForm.value.promotion_id || '')
      .set('filter[state]', this.searchForm.value.state || '')
      .set('filter[user.username]', this.searchForm.value.username || '');

    this.isLoading = true;
    this.promotionsService
      .progress(requestParams)
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

  private loadPromotions(): void {
    const params = new HttpParams().set('all', true);
    this.promotionsService.get(params).subscribe({
      next: (response) => {
        this.promotions = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
