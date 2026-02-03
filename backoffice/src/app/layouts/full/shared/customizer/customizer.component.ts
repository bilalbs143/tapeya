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

  options = this.settings.getOptions();
  @Output() readonly optionsChange = new EventEmitter<AppSettings>();
  hideSingleSelectionIndicator = signal(true);
  setDark() {
    this.settings.setOptions({ theme: 'dark' });
    this.emitOptions();
  }

  setColor(color: string) {
    this.settings.setOptions({ activeTheme: color });
    this.emitOptions();
  }

  setSidebar(sidenavOpened: boolean) {
    this.settings.setOptions({ sidenavOpened: sidenavOpened });
    this.emitOptions();
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }
}
