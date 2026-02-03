import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { BANK_ACCOUNT_TYPES, PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { BankAccountsService } from '../../shared/services/bank-accounts.service';
import { BanksService } from '../../shared/services/banks.service';
import { DialogData, MessageService } from '../../shared/services/message.service';

import { ManageBankAccountDialogComponent } from './manage-bank-account-dialog/manage-bank-account-dialog.component';

@Component({
  selector: 'app-bank-accounts',
  templateUrl: './bank-accounts.component.html',
  standalone: false,
})
export class BankAccountsComponent implements AfterViewInit, OnInit {
  private banksService = inject(BanksService);
  private bankAccountsService = inject(BankAccountsService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public banks: Array<any> = [];
  protected readonly accountTypes = BANK_ACCOUNT_TYPES;
  public displayedColumns: string[] = [
    '#',
    'logo',
    'type',
    'bank',
    'accountHolderName',
    'accountNumber',
    'qrCode',
    'status',
    'minDepositAmount',
    'maxDepositAmount',
    'bankTransactionFee',
    'bankTransactionSubsidi',
    'action',
  ];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadBanks();
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
      type: [''],
      bank: [''],
      accountHolderName: [''],
      accountNumber: [''],
      isActive: [''],
    });
  }

  private loadBanks(): void {
    this.banksService.get(new URLSearchParams()).subscribe({
      next: (response) => {
        this.banks = response.data || [];
      },
      error: (error) => {
        console.error('Error loading banks:', error);
      },
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
      .set('direction', this.sort?.direction || '')
      .set('filter[type]', this.searchForm.value.type || '')
      .set('filter[bank_id]', this.searchForm.value.bank || '')
      .set('filter[account_holder_name]', this.searchForm.value.accountHolderName || '')
      .set('filter[account_number]', this.searchForm.value.accountNumber || '')
      .set('filter[is_active]', this.searchForm.value.isActive || '');

    this.isLoading = true;
    this.bankAccountsService
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

  public openManageBankAccountDialog(action: string, _row: any = {}): void {
    const data: DialogData = { record: _row, action };
    this.messageService.openDialog(ManageBankAccountDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'sm',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_BANK_ACCOUNT',
      'WOULD_YOU_LIKE_TO_DELETE_THE_BANK_ACCOUNT',
      'DELETE',
      'CANCEL',
      (data: any) => this.bankAccountsService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public getBankName(bankId: string | number | any): string {
    if (typeof bankId === 'object' && bankId !== null) {
      return bankId.bank_name || '';
    }

    const bank = this.banks.find((b: any) => b.id === bankId);
    return bank ? bank.bank_name : '';
  }

  public getAccountTypeLabel(accountType: string): string {
    const type = this.accountTypes.find((t: any) => t.value === accountType);
    return type ? type.label : accountType;
  }
}
