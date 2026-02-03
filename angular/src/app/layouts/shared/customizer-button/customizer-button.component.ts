import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';

import { CustomizerButtonService } from '../../../shared/services/customizer-button.service';

@Component({
  selector: 'app-customizer-button',
  imports: [MatButtonModule, TablerIconComponent],
  templateUrl: './customizer-button.component.html',
})
export class CustomizerButtonComponent {
  private customizerButtonService = inject(CustomizerButtonService);

  public toggleSidenav(): void {
    this.customizerButtonService.toggle();
  }
}
