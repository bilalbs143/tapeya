import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-table-wrapper',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './table-wrapper.component.html',
})
export class TableWrapperComponent {
  @ViewChild('scrollContainer', { static: true })
  public scrollContainer!: ElementRef<HTMLDivElement>;

  /**
   * Controls the display of the loading state over the table.
   * Intentionally uses `mat-progress-bar` (top-of-table indeterminate bar) rather than the
   * shared gold `app-loader` ring — a bar reads better for "refreshing existing rows" than a
   * centered spinner would, since the table's current content stays visible underneath.
   */
  @Input() public loading: boolean = false;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  public startDragging(event: MouseEvent): void {
    // Allow text selection when Shift is pressed
    if (event.shiftKey || !this.scrollContainer) {
      return;
    }

    this.isDragging = true;
    const container = this.scrollContainer.nativeElement;
    this.startX = event.pageX - container.offsetLeft;
    this.scrollLeft = container.scrollLeft;
    container.style.cursor = 'grabbing';
  }

  public stopDragging(): void {
    if (!this.scrollContainer) {
      return;
    }

    this.isDragging = false;
    this.scrollContainer.nativeElement.style.cursor = 'auto';
  }

  @HostListener('window:mouseup')
  public onWindowMouseUp(): void {
    if (this.isDragging) {
      this.stopDragging();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.scrollContainer) {
      return;
    }

    // Stop dragging if Shift is pressed during drag to allow selection
    if (event.shiftKey) {
      this.stopDragging();
      return;
    }

    event.preventDefault();
    const container = this.scrollContainer.nativeElement;
    const x = event.pageX - container.offsetLeft;
    const walk = x - this.startX;
    container.scrollLeft = this.scrollLeft - walk;
  }
}
