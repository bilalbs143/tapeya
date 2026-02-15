import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-image.component.html',
})
export class TableImageComponent {
  @Input() public src: string | null = null;
  @Input() public alt = 'Image';
}
