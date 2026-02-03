import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [NgIf],
  template: `
    <div class="branding">
      <a href="/" *ngIf="options.theme === 'light'">
        <img
          src="https://art-chip.s3.ap-southeast-1.amazonaws.com/logo/artchip-logo-dark.png"
          style="width: 35%;"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
      <a href="/" *ngIf="options.theme === 'dark'">
        <img
          src="https://art-chip.s3.ap-southeast-1.amazonaws.com/logo/artchip-logo-light.png"
          style="width: 35%;"
          class="align-middle m-2"
          alt="logo"
        />
      </a>
    </div>
  `,
})
export class BrandingComponent {
  private settings = inject(CoreService);

  public options = this.settings.getOptions();
}
