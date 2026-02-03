import { Routes } from '@angular/router';

// theme pages
import { AppLandingpageComponent } from './landingpage.component';
import { AppCompoComponent } from './compo/compo.component';
import { AppBadgeComponent } from '../../ui-components/badge/badge.component';
import { AppExpansionComponent } from '../../ui-components/expansion/expansion.component';
import { AppChipsComponent } from '../../ui-components/chips/chips.component';
import { AppDialogComponent } from '../../ui-components/dialog/dialog.component';
import { AppListsComponent } from '../../ui-components/lists/lists.component';
import { AppDividerComponent } from '../../ui-components/divider/divider.component';
import { AppMenuComponent } from '../../ui-components/menu/menu.component';
import { AppPaginatorComponent } from '../../ui-components/paginator/paginator.component';
import { AppProgressComponent } from '../../ui-components/progress/progress.component';
import { AppProgressSnipperComponent } from '../../ui-components/progress-snipper/progress-snipper.component';
import { AppRipplesComponent } from '../../ui-components/ripples/ripples.component';
import { AppSlideToggleComponent } from '../../ui-components/slide-toggle/slide-toggle.component';
import { AppSliderComponent } from '../../ui-components/slider/slider.component';
import { AppSnackbarComponent } from '../../ui-components/snackbar/snackbar.component';
import { AppTabsComponent } from '../../ui-components/tabs/tabs.component';
import { AppToolbarComponent } from '../../ui-components/toolbar/toolbar.component';
import { AppTooltipsComponent } from '../../ui-components/tooltips/tooltips.component';
import { AppAutocompleteComponent, AppButtonComponent, AppCheckboxComponent, AppDatepickerComponent, AppRadioComponent } from '../../forms/form-elements';
import { AppFormLayoutsComponent } from '../../forms/form-layouts/form-layouts.component';
import { AppFormHorizontalComponent } from '../../forms/form-horizontal/form-horizontal.component';
import { AppFormVerticalComponent } from '../../forms/form-vertical/form-vertical.component';
import { AppFormWizardComponent } from '../../forms/form-wizard/form-wizard.component';
import { AppBasicTableComponent } from '../../tables/basic-table/basic-table.component';
import { AppDynamicTableComponent } from '../../tables/dynamic-table/dynamic-table.component';
import { AppExpandTableComponent } from '../../tables/expand-table/expand-table.component';
import { AppFilterableTableComponent } from '../../tables/filterable-table/filterable-table.component';
import { AppFooterRowTableComponent } from '../../tables/footer-row-table/footer-row-table.component';
import { AppHttpTableComponent } from '../../tables/http-table/http-table.component';
import { AppMixTableComponent } from '../../tables/mix-table/mix-table.component';
import { AppMultiHeaderFooterTableComponent } from '../../tables/multi-header-footer-table/multi-header-footer-table.component';
import { AppPaginationTableComponent } from '../../tables/pagination-table/pagination-table.component';
import { AppRowContextTableComponent } from '../../tables/row-context-table/row-context-table.component';
import { AppSelectionTableComponent } from '../../tables/selection-table/selection-table.component';
import { AppSortableTableComponent } from '../../tables/sortable-table/sortable-table.component';
import { AppStickyColumnTableComponent } from '../../tables/sticky-column-table/sticky-column-table.component';
import { AppStickyHeaderFooterTableComponent } from '../../tables/sticky-header-footer-table/sticky-header-footer-table.component';


export const LandingPageRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        title: 'Landingpage',
        component: AppLandingpageComponent,
      },
      {
        path: 'components',
        component: AppCompoComponent,
        children: [
          { path: 'badge', component: AppBadgeComponent },
          { path: 'expansion', component: AppExpansionComponent },
          { path: 'chips', component: AppChipsComponent },
          { path: 'dialog', component: AppDialogComponent },
          { path: 'lists', component: AppListsComponent },
          { path: 'divider', component: AppDividerComponent },
          { path: 'menu', component: AppMenuComponent },
          { path: 'paginator', component: AppPaginatorComponent },
          { path: 'progress', component: AppProgressComponent },
          { path: 'progress-spinner', component: AppProgressSnipperComponent },
          { path: 'ripples', component: AppRipplesComponent },
          { path: 'slide-toggle', component: AppSlideToggleComponent },
          { path: 'slider', component: AppSliderComponent },
          { path: 'snackbar', component: AppSnackbarComponent },
          { path: 'tabs', component: AppTabsComponent },
          { path: 'toolbar', component: AppToolbarComponent },
          { path: 'tooltips', component: AppTooltipsComponent },

          { path: 'autocomplete', component: AppAutocompleteComponent },
          { path: 'button', component: AppButtonComponent },
          { path: 'checkbox', component: AppCheckboxComponent },
          { path: 'radio', component: AppRadioComponent },
          { path: 'datepicker', component: AppDatepickerComponent },
          { path: 'form-layouts', component: AppFormLayoutsComponent },
          { path: 'form-horizontal', component: AppFormHorizontalComponent },
          { path: 'form-vertical', component: AppFormVerticalComponent },
          { path: 'form-wizard', component: AppFormWizardComponent },

          { path: 'basic-table', component: AppBasicTableComponent },
          { path: 'dynamic-table', component: AppDynamicTableComponent },
          { path: 'expand-table', component: AppExpandTableComponent },
          { path: 'filterable-table', component: AppFilterableTableComponent },
          { path: 'footer-row-table', component: AppFooterRowTableComponent },
          { path: 'http-table', component: AppHttpTableComponent },
          { path: 'mix-table', component: AppMixTableComponent },
          { path: 'multi-header-footer-table', component: AppMultiHeaderFooterTableComponent },
          { path: 'pagination-table', component: AppPaginationTableComponent },
          { path: 'row-context-table', component: AppRowContextTableComponent },
          { path: 'selection-table', component: AppSelectionTableComponent },
          { path: 'sortable-table', component: AppSortableTableComponent },
          { path: 'sticky-column-table', component: AppStickyColumnTableComponent },
          { path: 'sticky-header-footer-table', component: AppStickyHeaderFooterTableComponent },
        ],
      },
    ],
  },
];
