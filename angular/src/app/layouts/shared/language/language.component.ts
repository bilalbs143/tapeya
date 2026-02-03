import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';

import { LANGUAGES } from '../../../shared/constants/constants';
import { TranslationLoaderService } from '../../../shared/services/translation-loader.service';

@Component({
  selector: 'app-language',
  imports: [MatButtonModule, MatMenuModule],
  templateUrl: './language.component.html',
})
export class LanguageComponent {
  private translate = inject(TranslateService);
  private translationLoaderService = inject(TranslationLoaderService);

  protected readonly languages = LANGUAGES;
  public selectedLanguageIcon: any = '';

  constructor() {
    const translationLoaderService = this.translationLoaderService;

    this.selectedLanguageIcon = `/assets/images/flag/icon-flag-${translationLoaderService.getLanguage()}.svg`;
  }

  public changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguageIcon = lang.icon;
    this.translationLoaderService.setLanguage(lang.code, true);
  }
}
