import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-skeleton" role="status" aria-live="polite" aria-busy="true" [attr.aria-label]="label">
      <div class="table-skeleton__header" aria-hidden="true">
        @for (_ of colIndexes; track $index) {
          <span class="table-skeleton__bar table-skeleton__bar--header"></span>
        }
      </div>
      @for (_ of rowIndexes; track $index) {
        <div class="table-skeleton__row" aria-hidden="true">
          @for (__ of colIndexes; track $index) {
            <span class="table-skeleton__bar"></span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './table-skeleton.component.scss',
  host: {
    '[style.--skeleton-cols]': 'columns',
  },
})
export class TableSkeletonComponent implements OnChanges {
  @Input() public columns = 6;
  @Input() public rowCount = 20;
  @Input() public label = 'Loading table';

  public colIndexes: number[] = this.makeIndexes(6);
  public rowIndexes: number[] = this.makeIndexes(20);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.colIndexes = this.makeIndexes(this.columns);
    }
    if (changes['rowCount']) {
      this.rowIndexes = this.makeIndexes(this.rowCount);
    }
  }

  private makeIndexes(count: number): number[] {
    return Array.from({ length: Math.max(1, count | 0) }, (_, i) => i);
  }
}
