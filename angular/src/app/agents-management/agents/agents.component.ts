import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  baseHttpParams,
  addCreatedFilter,
  addUsernameFilter,
  calculateAgentsStats,
  getLoggedInUserType,
} from 'src/app/shared/functions/core.function';
import { HelpersService } from 'src/app/shared/services/helpers.service';

import { PAGING } from '../../shared/constants/constants';
import { AgentsManagementService } from '../../shared/services/agents-management.service';
import { DialogData, MessageService } from '../../shared/services/message.service';

import { AddAgentDialogComponent } from './add-agent-dialog/add-agent-dialog.component';
import { ManageAgentPermissionsDialogComponent } from './manage-agent-permissions-dialog/manage-agent-permissions-dialog.component';

@Component({
  selector: 'app-coupon-points-exchange',
  templateUrl: './agents.component.html',
  standalone: false,
})
export class AgentsComponent implements AfterViewInit, OnInit {
  private readonly messageService = inject(MessageService);
  private agentsManagementService = inject(AgentsManagementService);
  private fb = inject(FormBuilder);
  private helperService = inject(HelpersService);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public sumArray: any;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.initializeDisplayedColumns();
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  private initializeDisplayedColumns(): void {
    const baseColumns = [
      '#',
      'name',
      'username',
      'subAgentsCount',
      'membersCount',
      'level',
      'referralCode',
      'losingMoneyRatio',
      'losingPoints',
      'rollingRatio',
      'rollingAmount',
      'couponPoints',
      'phoneNumber',
      'created_at',
    ];

    if (getLoggedInUserType() !== 'AGENT') {
      baseColumns.push('permissions');
    }

    this.displayedColumns = baseColumns;
  }

  public getLoggedInUserType(): string | null {
    return getLoggedInUserType();
  }

  public ngAfterViewInit(): void {
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
      status: [''],
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

  public openAddAgentDialog(): void {
    this.messageService.openDialog(AddAgentDialogComponent, {}, () => this.loadHttpData(), {
      widthSize: 'lg',
    });
  }

  public openManageAgentPermissionsDialog(_row: any): void {
    const data: DialogData = { record: _row };
    this.messageService.openDialog(ManageAgentPermissionsDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'md',
    });
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addUsernameFilter(requestParams, this.searchForm);
    requestParams = addCreatedFilter(requestParams, this.searchForm);

    this.isLoading = true;
    this.helperService.loadHttpData(
      this.agentsManagementService,
      requestParams,
      this.dataSource,
      (totalRecords: number) => {
        this.sumArray = calculateAgentsStats(this.dataSource.data);
        this.totalRecords = totalRecords;
      },
      () => (this.isLoading = false)
    );
  }

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }
}
