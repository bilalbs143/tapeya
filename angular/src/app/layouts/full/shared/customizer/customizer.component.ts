import { Component, Output, EventEmitter, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/app.config';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-customizer',
  imports: [TablerIconComponent, MaterialModule, FormsModule, NgScrollbarModule, TranslateModule],
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomizerComponent {
  private settings = inject(CoreService);

  @Output() readonly optionsChange = new EventEmitter<AppSettings>();
  hideSingleSelectionIndicator = signal(true);

  public options = this.settings.getOptions();

  public setDark(theme: string): void {
    this.options.theme = theme;
    this.settings.setOptions({ theme: theme });
    this.optionsChange.emit(this.options);
  }

  public setColor(color: string): void {
    this.options.activeTheme = color;
    this.settings.setOptions({ activeTheme: color });
    this.optionsChange.emit(this.options);
  }

  public setSidebar(sidenavOpened: boolean): void {
    this.options.sidenavOpened = sidenavOpened;
    this.settings.setOptions({ sidenavOpened: sidenavOpened });
    this.optionsChange.emit(this.options);
  }

  public setLayout(horizontal: boolean): void {
    this.options.horizontal = horizontal;
    this.settings.setOptions({ horizontal: horizontal });
    this.optionsChange.emit(this.options);
  }

  public setCardBorder(cardBorder: boolean): void {
    this.options.cardBorder = cardBorder;
    this.settings.setOptions({ cardBorder: cardBorder });
    this.optionsChange.emit(this.options);
  }
  public setBoxContainer(boxed: boolean): void {
    this.options.boxed = boxed;
    this.settings.setOptions({ boxed: boxed });
    this.optionsChange.emit(this.options);
  }
}
