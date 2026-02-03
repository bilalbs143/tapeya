import { Component, inject } from '@angular/core';

import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/" class="logodark">
      <img src="./assets/images/logos/dark-logo.svg" class="align-middle m-2" alt="logo" />
    </a>

    <a href="/" class="logolight">
      <img src="./assets/images/logos/light-logo.svg" class="align-middle m-2" alt="logo" />
    </a>
  `,
})
export class BrandingComponent {
  private readonly settings = inject(CoreService);
  options = this.settings.getOptions();
}
