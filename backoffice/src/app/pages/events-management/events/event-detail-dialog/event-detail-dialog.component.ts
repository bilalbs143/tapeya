import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/list';
import { TablerIconsModule } from 'angular-tabler-icons';

import type { Event } from 'src/app/services/events.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface EventDetailDialogData {
  event: Event;
}

@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDivider, TablerIconsModule, DialogWrapperComponent],
  templateUrl: './event-detail-dialog.component.html',
})
export class EventDetailDialogComponent {
  public readonly data = inject<EventDetailDialogData>(MAT_DIALOG_DATA);

  public readonly event = this.data.event;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
}
