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
  styles: [
    `
      app-search-filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
      }

      app-search-filter-bar .mat-mdc-form-field {
        width: 100%;
        margin-bottom: 0;
      }

      /* Desktop: 1–3 filters stay compact */
      app-search-filter-bar > * {
        flex: 0 1 22rem;
        min-width: 10rem;
        max-width: 22rem;
      }

      /* Desktop: 4+ filters fill the row with equal columns */
      app-search-filter-bar:has(> :nth-child(4)) > * {
        flex: 1 1 0%;
        max-width: none;
        min-width: 10rem;
      }

      @media (min-width: 768px) and (max-width: 1023px) {
        app-search-filter-bar > * {
          flex: 1 1 calc(50% - 0.5rem);
          max-width: none;
          min-width: 0;
        }

        app-search-filter-bar:not(:has(> :nth-child(4))) > * {
          flex: 0 1 calc(50% - 0.5rem);
          max-width: 22rem;
        }
      }

      @media (max-width: 767px) {
        app-search-filter-bar > * {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
      }
    `,
  ],
})
export class SearchFilterBarComponent {}
