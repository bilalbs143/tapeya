import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { getStatusClass } from 'src/app/utils/status-class.util';

/**
 * The one status/boolean pill used across every table — see docs/BACKOFFICE_UX_AUDIT.md §1.3.
 * Accepts either a status string (uses its own label unless overridden) or a boolean
 * (Active/Inactive by default). Color always comes from the shared `getStatusClass` map,
 * never a page-local `[ngClass]`.
 */
@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="rounded-sm px-1.5 py-1 text-xs font-semibold"
      [ngClass]="statusClass"
    >
      {{ resolvedLabel }}
    </span>
  `,
})
export class StatusChipComponent {
  /** A status string (e.g. `row.status`) or a boolean (e.g. `row.is_active`). */
  @Input({ required: true }) public status: string | boolean | null | undefined;

  /** Display label when `status` is a string. Defaults to the raw value. */
  @Input() public label?: string | null;

  /** Display label when `status` is `true`. */
  @Input() public trueLabel = 'Active';

  /** Display label when `status` is `false`. */
  @Input() public falseLabel = 'Inactive';

  public get statusClass(): string {
    if (typeof this.status === 'boolean') {
      return getStatusClass(this.status ? 'active' : 'inactive');
    }
    return getStatusClass(this.status);
  }

  public get resolvedLabel(): string {
    if (typeof this.status === 'boolean') {
      return this.status ? this.trueLabel : this.falseLabel;
    }
    return this.label ?? this.status ?? '—';
  }
}
