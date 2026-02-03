import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MessageService } from 'src/app/shared/services/message.service';
import { ProvidersService } from 'src/app/shared/services/providers.service';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, addUsernameFilter, baseHttpParams, calculateBetsStats } from '../../shared/functions/core.function';
import { BetsHistoryService } from '../../shared/services/bets-history.service';

import { ViewGameResultComponent } from './view-game-result-dialog/view-game-result.component';

@Component({
  selector: 'app-bets-history',
  templateUrl: './bets-history.component.html',
  standalone: false,
})
export class BetsHistoryComponent implements AfterViewInit, OnInit {
  private readonly messageService = inject(MessageService);
  private betHistoryService = inject(BetsHistoryService);
  private providersService = inject(ProvidersService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public sumArray: any;
  public providers: Array<any> = [];
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = [
    '#',
    'name',
    'username',
    'betId',
    'provider',
    'gameName',
    'status',
    'startingBalance',
    'bet',
    'win',
    'refund',
    'finalBalance',
    'detail',
    'createdAt',
  ];
  public dataSource = new MatTableDataSource([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadHttpData();
    this.getAllProviders();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      this.loadHttpData();
    });
  }

  public openViewGameResultDialog(url: string): void {
    this.messageService.openDialog(ViewGameResultComponent, { action: url }, () => null, {
      widthSize: 'lg',
    });
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      username: [''],
      name: [''],
      created_before: [''],
      created_after: [''],
      state: [''],
      provider_id: [''],
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
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addCreatedFilter(requestParams, this.searchForm);
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'user.')
      .set('filter[state]', this.searchForm.value.state || '')
      .set('filter[provider_id]', this.searchForm.value.provider_id || '');

    this.isLoading = true;
    this.betHistoryService
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
          this.sumArray = calculateBetsStats(this.dataSource.data);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public getAllProviders(): void {
    const requestParams = new HttpParams().set('all', true);
    this.providersService.get(requestParams).subscribe({
      next: (response) => {
        this.providers = response.data || [];
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
