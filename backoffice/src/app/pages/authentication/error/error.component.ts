import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-error',
  imports: [RouterModule, MaterialModule, MatButtonModule],
  templateUrl: './error.component.html',
})
export class AppErrorComponent {}
