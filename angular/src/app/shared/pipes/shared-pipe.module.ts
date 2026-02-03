import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FilterPipe } from './filter.pipe';
import { HtmlToTextPipe } from './html-to-text.pipe';
import { RemoveCommasPipe } from './remove-commas.pipe';
import { StrReplacePipe } from './string-replace-pipe';
import { TitleCasePipe } from './title-case.pipe';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [TitleCasePipe, RemoveCommasPipe, HtmlToTextPipe, TruncatePipe, FilterPipe, StrReplacePipe],
  exports: [TitleCasePipe, RemoveCommasPipe, HtmlToTextPipe, FilterPipe, StrReplacePipe, TruncatePipe],
})
export class SharedPipeModule {}
