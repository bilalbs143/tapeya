import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../../../material.module';

import { CommonSharedModule } from 'src/app/shared/common.module';

@Component({
  selector: 'app-error',
  imports: [RouterModule, MaterialModule, CommonSharedModule],
  templateUrl: './error.component.html',
})
export class AppErrorComponent {}
