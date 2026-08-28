import { Component, EventEmitter, inject, Output, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { AppSettings } from 'src/app/config';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-customizer',
  imports: [TablerIconsModule, MaterialModule, FormsModule, NgScrollbarModule],
  templateUrl: './customizer.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class CustomizerComponent {
  private readonly settings = inject(CoreService);

  /** Always read current options from the service (single source of truth, includes persisted state). */
  public get options(): AppSettings {
    return this.settings.getOptions();
  }

  @Output() public readonly optionsChange = new EventEmitter<AppSettings>();
  public hideSingleSelectionIndicator = signal(true);

  public setDark(): void {
    this.settings.setOptions({ theme: this.options.theme });
    this.emitOptions();
  }

  public setSidebarCollapsed(collapsed: boolean): void {
    this.settings.setOptions({ sidenavCollapsed: collapsed });
    this.emitOptions();
  }

  public setHorizontal(horizontal: boolean): void {
    this.settings.setOptions({ horizontal });
    this.emitOptions();
  }

  public setCardBorder(cardBorder: boolean): void {
    this.settings.setOptions({ cardBorder });
    this.emitOptions();
  }

  public setBoxed(boxed: boolean): void {
    this.settings.setOptions({ boxed });
    this.emitOptions();
  }

  private emitOptions(): void {
    this.optionsChange.emit(this.settings.getOptions());
  }
}
