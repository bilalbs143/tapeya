import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { UiButtonComponent } from 'src/app/shared/components/ui-button/ui-button.component';

/**
 * The one "no data" state used across every table/list — icon well + bold
 * title + muted description (+ optional action), centered. Used by
 * `app-paginator` for every list page automatically — most pages never need
 * to touch this component directly, just override `message`/`description`
 * if the default filtered-list copy doesn't fit (e.g. a page that can be
 * empty with no filters applied at all).
 */
@Component({
  selector: 'app-empty-data-message',
  standalone: true,
  imports: [TablerIconsModule, UiButtonComponent],
  templateUrl: './empty-data-message.component.html',
  styleUrl: './empty-data-message.component.scss',
})
export class EmptyDataMessageComponent {
  @Input() public variant: 'overlay' | 'inline' = 'overlay';

  /** Bold headline. */
  @Input() public message: string = 'No Data Available';

  /** Muted supporting line under the title. Pass '' to hide it. */
  @Input() public description: string = 'Try adjusting your filters or search terms.';

  /** Tabler icon name for the icon well. */
  @Input() public icon: string = 'search-off';

  /** Optional action button (e.g. "Reset Filters") — hidden unless set. */
  @Input() public actionLabel: string | null = null;

  @Output() public readonly action = new EventEmitter<void>();
}
