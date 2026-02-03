import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { AppPaginatorComponent } from './app-paginator.component';

@NgModule({
  declarations: [AppPaginatorComponent],
  imports: [CommonModule, TranslateModule, MatPaginatorModule, NgxSkeletonLoaderModule],
  exports: [AppPaginatorComponent],
})
export class AppPaginatorModule {}
