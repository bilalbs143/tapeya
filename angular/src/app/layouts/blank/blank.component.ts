import { Component, inject } from '@angular/core';
import { AppSettings } from 'src/app/app.config';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: [],
  standalone: false,
})
export class BlankComponent {
  private settings = inject(CoreService);

  private htmlElement!: HTMLHtmlElement;

  public options = this.settings.getOptions();
  public resView = false;

  constructor() {
    this.htmlElement = document.querySelector('html')!;
    this.receiveOptions(this.options);
  }

  public receiveOptions(options: AppSettings): void {
    this.options = { ...this.options, ...options };
    this.toggleDarkTheme(options);
    this.toggleColorsTheme(options);
  }

  private toggleDarkTheme(options: AppSettings): void {
    this.htmlElement.classList.remove('dark-theme', 'light-theme');
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
    } else {
      this.htmlElement.classList.add('light-theme');
    }
  }

  private toggleColorsTheme(options: AppSettings): void {
    const classList = Array.from(this.htmlElement.classList);
    classList.forEach((className) => {
      if (className.endsWith('_theme')) {
        this.htmlElement.classList.remove(className);
      }
    });
    this.htmlElement.classList.add(options.activeTheme);
  }
}
