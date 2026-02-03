import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { TABLE_LOADER } from '../../constants/constants';

@Component({
  selector: 'app-table-wrapper',
  imports: [NgxSkeletonLoaderModule],
  templateUrl: './table-wrapper.component.html',
})
export class TableWrapperComponent {
  @ViewChild('scrollContainer') public scrollContainer: ElementRef;
  private isDragging: boolean = false;
  @Input() public isLoading: any;
  private startX: number;
  private scrollLeft: number;
  public tableLoader = TABLE_LOADER;

  public startDragging(event: MouseEvent): void {
    if (!this.canStartDrag(event)) {
      return;
    }
    this.isDragging = true;
    this.startX = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeft = this.scrollContainer.nativeElement.scrollLeft;
    this.scrollContainer.nativeElement.style.cursor = 'grabbing';
  }

  public stopDragging(): void {
    this.isDragging = false;
    this.scrollContainer.nativeElement.style.cursor = 'auto';
  }

  private canStartDrag(event: MouseEvent): boolean {
    // Disable drag when Shift is pressed to allow text selection
    if (event.shiftKey) {
      return false;
    }
    // Enable drag on single click (no double click required)
    return true;
  }

  @HostListener('window:mousemove', ['$event'])
  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    // Stop dragging if Shift is pressed during drag to allow selection
    if (event.shiftKey) {
      this.stopDragging();
      return;
    }
    event.preventDefault();
    const x = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = x - this.startX; //scroll-fast
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeft - walk;
  }
}
