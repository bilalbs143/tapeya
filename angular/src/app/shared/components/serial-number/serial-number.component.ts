import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-serial-number',
  imports: [],
  templateUrl: './serial-number.component.html',
})
export class SerialNumberComponent {
  @Input() public currentPage: number;
  @Input() public pageSize: number;
  @Input() public totalRecords: number;
  @Input() public i: number;
}
