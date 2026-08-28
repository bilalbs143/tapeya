import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { PAGINATOR_CONFIG } from '../../config/paginator.config';
import { EmptyDataMessageComponent } from '../empty-data-message/empty-data-message.component';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [MatPaginatorModule, EmptyDataMessageComponent],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  private readonly config = inject(PAGINATOR_CONFIG);

  @ViewChild(MatPaginator) public matPaginator!: MatPaginator;

  @Input() public length: number = 0;
  @Input() public pageIndex: number = 0;
  @Input() public pageSize: number = this.config.pageSize;
  @Input() public pageSizeOptions: number[] = this.config.pageSizeOptions;
  @Input() public showFirstLastButtons: boolean = this.config.showFirstLastButtons;
  @Input() public ariaLabel: string = 'Select page';
  @Input() public showNoRecMessage: boolean = true;
  @Input() public noRecMessage: string = 'No Data Available';

  @Output() public readonly page = new EventEmitter<PageEvent>();
}
