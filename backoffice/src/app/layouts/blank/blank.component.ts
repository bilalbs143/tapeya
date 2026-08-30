import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';
import { applyDocumentTheme } from 'src/app/shared/functions/theme-swap.function';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  imports: [RouterOutlet, MaterialModule],
})
export class BlankComponent {
  private readonly settings = inject(CoreService);

  constructor() {
    applyDocumentTheme(this.settings.getOptions().theme);
  }
}
