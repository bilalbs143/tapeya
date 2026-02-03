import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SharedModule } from '../../shared.module';
import { DialogWrapperModule } from '../dialog-wrapper/dialog-wrapper.module';

@Component({
  selector: 'app-html-content-dialog',
  imports: [SharedModule, DialogWrapperModule],
  templateUrl: './html-content-dialog.component.html',
})
export class HtmlContentDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);

  public title: string;
  public content: string;

  public ngOnInit(): void {
    this.content = this.data.record.content;
    this.title = this.data.record.title;
  }
}
