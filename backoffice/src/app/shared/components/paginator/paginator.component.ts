import { Component, inject, Input, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { PAGINATOR_CONFIG } from '../../config/paginator.config';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [MatPaginatorModule],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  private readonly config = inject(PAGINATOR_CONFIG);

  @ViewChild(MatPaginator) public matPaginator!: MatPaginator;

  @Input() public length: number = 0;
  @Input() public pageSize: number = this.config.pageSize;
  @Input() public pageSizeOptions: number[] = this.config.pageSizeOptions;
  @Input() public showFirstLastButtons: boolean = this.config.showFirstLastButtons;
  @Input() public ariaLabel: string = 'Select page';
}
