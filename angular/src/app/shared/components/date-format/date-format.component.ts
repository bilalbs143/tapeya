import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-date-format',
  standalone: true,
  imports: [DatePipe],
  template: `{{ value | date: format }}`,
})
export class DateFormatComponent {
  @Input() value: string | Date | null = null;
  @Input() public format: string = 'yyyy-MM-dd HH:mm:ss';
}
