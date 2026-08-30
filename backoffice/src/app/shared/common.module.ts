import { NgModule } from '@angular/core';

import { DetailPageComponent } from './components/detail-page/detail-page.component';
import { DialogWrapperComponent } from './components/dialog-wrapper/dialog-wrapper.component';
import { LoaderBlockComponent } from './components/loader/loader-block.component';
import { LoaderComponent } from './components/loader/loader.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { SearchFilterBarComponent } from './components/search-filter-bar/search-filter-bar.component';
import { StatusChipComponent } from './components/status-chip/status-chip.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TableSkeletonComponent } from './components/table-skeleton/table-skeleton.component';
import { TableWrapperComponent } from './components/table-wrapper/table-wrapper.component';
import { UiButtonComponent } from './components/ui-button/ui-button.component';

/**
 * Bundles the shared components used across most backoffice list/dialog pages
 * (page header, filter bar, table wrapper, paginator, dialog shell, submit
 * button, loaders) so pages import one thing instead of listing each
 * standalone component individually.
 *
 * Page-type-specific components (file upload, avatar uploader, table image,
 * post content preview, empty-data message) stay out of this bundle —
 * import those directly where actually used.
 *
 * Pair with MaterialModule for Mat form fields, dialogs, tables, etc.
 */
const SHARED_COMPONENTS = [
  PageHeaderComponent,
  DetailPageComponent,
  SearchFilterBarComponent,
  TableWrapperComponent,
  TableSkeletonComponent,
  PaginatorComponent,
  DialogWrapperComponent,
  SubmitButtonComponent,
  LoaderComponent,
  LoaderBlockComponent,
  StatusChipComponent,
  UiButtonComponent,
];

@NgModule({
  imports: [...SHARED_COMPONENTS],
  exports: [...SHARED_COMPONENTS],
})
export class CommonSharedModule {}
