import { booleanAttribute, Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { PAGINATOR_CONFIG } from '../../config/paginator.config';
import { EmptyDataMessageComponent } from '../empty-data-message/empty-data-message.component';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [MatPaginatorModule, EmptyDataMessageComponent],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  private readonly config = inject(PAGINATOR_CONFIG);

  @ViewChild(MatPaginator) public matPaginator!: MatPaginator;

  @Input() public length: number = 0;
  @Input() public pageIndex: number = 0;
  @Input() public pageSize: number = this.config.pageSize;
  @Input() public pageSizeOptions: number[] = this.config.pageSizeOptions;
  @Input() public showFirstLastButtons: boolean = this.config.showFirstLastButtons;
  @Input() public ariaLabel: string = 'Select Page';
  @Input({ transform: booleanAttribute }) public loading = false;
  @Input() public showNoRecMessage: boolean = true;
  @Input() public noRecMessage: string = 'No Data Available';
  @Input() public noRecDescription: string = 'Try adjusting your filters or search terms.';
  @Input() public noRecIcon: string = 'search-off';
  @Input() public noRecActionLabel: string | null = null;

  @Input({ transform: booleanAttribute }) public error = false;
  @Input() public errorMessage = 'Could not load this list';
  @Input() public errorDescription = 'Check your connection and try again.';
  @Input() public retryLabel = 'Retry';

  @Output() public readonly page = new EventEmitter<PageEvent>();
  @Output() public readonly noRecAction = new EventEmitter<void>();
  @Output() public readonly retry = new EventEmitter<void>();

  public get rangeLabel(): string {
    if (!this.length) return 'Showing 0 of 0';
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min(this.length, (this.pageIndex + 1) * this.pageSize);
    return `Showing ${start}–${end} of ${this.length}`;
  }
}
