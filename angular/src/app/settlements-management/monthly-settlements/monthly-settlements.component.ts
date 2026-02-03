import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';

import { PAGING } from '../../shared/constants/constants';
import { AgentsManagementService } from '../../shared/services/agents-management.service';
import { SettlementsManagementService } from '../../shared/services/settlements-management.service';

@Component({
  selector: 'app-monthly-settlements',
  templateUrl: './monthly-settlements.component.html',
  standalone: false,
})
export class MonthlySettlementsComponent implements OnInit {
  private readonly settlementsManagementService = inject(SettlementsManagementService);
  private readonly agentsManagementService = inject(AgentsManagementService);
  private fb = inject(FormBuilder);

  public searchForm: FormGroup;
  public agents: Array<any> = [];
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public isLoading: boolean = true;
  public displayedColumns: string[] = [
    'date',
    'requestedMembersCount',
    'depositedMoney',
    'withdrawalMoney',
    'moneyIncomeLoss',
    'losingMoneyWithdrawal',
    'rollingMoneyWithdrawal',
    'pointsExchange',
    'couponPointsExchange',
    'bettingAmount',
    'winningAmount',
    'bettingDifference',
    'depositedMoneyByAdmin',
    'withdrawalMoneyByAdmin',
    'pointsCreditedByAdmin',
    'pointsDebitedByAdmin',
    'couponPointsCreditedByAdmin',
    'couponPointsDebitedByAdmin',
    'rollingMoneyCredited',
    'losingMoneyCredited',
    'losingMoneyDebited',
  ];
  public dataSource = new MatTableDataSource([]);

  public ngOnInit(): void {
    this.getAllAgents();
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      agent_id: [''],
      date_after: [''],
      date_before: [''],
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
    this.isLoading = true;
    const requestParams = new HttpParams()
      .set('perPage', perPageLimit)
      .set('page', currentPageView.toString())
      .set('agent_id', this.searchForm.value.agent_id)
      .set('filter[date_after]', this.searchForm.value.date_after ? moment(this.searchForm.value.date_after).format('YYYY-MM-DD') : '')
      .set('filter[date_before]', this.searchForm.value.date_before ? moment(this.searchForm.value.date_before).format('YYYY-MM-DD') : '');

    this.settlementsManagementService.monthly(requestParams).subscribe(
      (response) => {
        this.dataSource.data = response.data || [];
        this.totalRecords = response.meta.total || 0;
      },
      (error) => {
        console.error('Error:', error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }

  private getAllAgents(): void {
    const requestParams = new HttpParams().set('all', true);
    this.agentsManagementService.get(requestParams).subscribe({
      next: (response) => {
        this.agents = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
