import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaterialModule } from 'src/app/material.module';

import { BrandingComponent } from './branding.component';

@Component({
  selector: 'app-sidebar',
  imports: [BrandingComponent, TablerIconsModule, MaterialModule, FormsModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() public showToggle = true;
  @Input() public searchQuery = '';
  @Output() public readonly toggleMobileNav = new EventEmitter<void>();
  @Output() public readonly searchQueryChange = new EventEmitter<string>();

  @ViewChild('searchInput') private readonly searchInput?: ElementRef<HTMLInputElement>;

  public onSearchInput(value: string): void {
    this.searchQueryChange.emit(value);
  }

  public clearSearch(): void {
    this.searchQueryChange.emit('');
    this.searchInput?.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  public onGlobalKeydown(event: KeyboardEvent): void {
    const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (!isModK) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      // Allow ⌘K inside our own search to select-all; ignore other fields.
      if (target !== this.searchInput?.nativeElement) {
        return;
      }
    }
    event.preventDefault();
    this.searchInput?.nativeElement.focus();
    this.searchInput?.nativeElement.select();
  }
}
