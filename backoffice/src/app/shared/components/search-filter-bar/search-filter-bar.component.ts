import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Single source of truth for all search/filter bar layouts.
 *
 * Pages declare filter controls only — no widths, no grid logic.
 * This component owns every layout decision automatically.
 *
 * Desktop layout rules:
 *   1–3 filters → compact slots, capped at 22 rem each (no full-row stretch)
 *   4+ filters  → equal distribution across full row width
 *   Tablet      → ~2 per row
 *   Mobile      → single column, full width
 */
@Component({
  selector: 'app-search-filter-bar',
  standalone: true,
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './search-filter-bar.component.scss',
})
export class SearchFilterBarComponent {}
