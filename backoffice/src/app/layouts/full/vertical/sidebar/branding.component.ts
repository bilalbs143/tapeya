import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-branding',
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="branding-link" aria-label="Tapeya">
      <img class="logodark branding-logo" src="./assets/images/logos/tapeya-logo-light-theme.png" alt="Tapeya" />
      <img class="logolight branding-logo" src="./assets/images/logos/tapeya-logo-dark-theme.png" alt="Tapeya" />
    </a>
  `,
  styleUrl: './branding.component.scss',
})
export class BrandingComponent {}
