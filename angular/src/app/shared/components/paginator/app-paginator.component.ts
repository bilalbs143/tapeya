import { Component, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { PAGING } from '../../constants/constants';

@Component({
  selector: 'app-paginator',
  templateUrl: './app-paginator.component.html',
  standalone: false,
})
export class AppPaginatorComponent implements AfterViewInit {
  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @Output() private readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();
  @Input() public currentPage: number = 1;
  @Input() public length: number;
  @Input() public pageSize: number = PAGING.perPage;
  @Input() public pageSizeOptions: number[] = PAGING.pageSizeOptions;
  @Input() public showNoRecMessage: boolean = true;

  public ngAfterViewInit(): void {
    this.paginator.pageSize = this.pageSize;
    this.paginator.pageSizeOptions = this.pageSizeOptions;
  }

  public setPage(event: PageEvent): void {
    this.page.emit(event);
  }
}
